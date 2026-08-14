import { Test, TestingModule } from '@nestjs/testing';
import { KotdService } from './kotd.service';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('KotdService', () => {
  let service: KotdService;

  const mockPrismaService = {
    jersey: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    dailyKitNotification: {
      create: jest.fn(),
    },
    jerseyLike: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockR2Service = {
    getSignedUrl: jest.fn(),
  };

  const mockNotificationsService = {
    sendPushNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KotdService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: R2Service, useValue: mockR2Service },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<KotdService>(KotdService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getJerseyOfTheDay', () => {
    const buildJersey = (overrides = {}) => ({
      id: 'jersey-1',
      season: '2004',
      type: 'HOME',
      version: 'REPLICA',
      playerName: null,
      frontImageUrl: 'front.jpg',
      backImageUrl: 'back.jpg',
      club: { name: 'Arsenal' },
      user: {
        id: 'owner-id',
        username: 'thomas',
        isPublic: true,
        expoPushToken: 'push-token-abc',
      },
      _count: { likes: 3 },
      ...overrides,
    });

    it('should return null if there are no jerseys at all', async () => {
      mockPrismaService.jersey.findMany.mockResolvedValue([]);

      const result = await service.getJerseyOfTheDay();

      expect(result).toBeNull();
    });

    it('should return the selected jersey enriched with story, signed urls, and like info', async () => {
      const jersey = buildJersey();
      mockPrismaService.jersey.findMany.mockResolvedValue([jersey]);
      mockPrismaService.dailyKitNotification.create.mockResolvedValue({});
      mockR2Service.getSignedUrl
        .mockResolvedValueOnce('signed-front.jpg')
        .mockResolvedValueOnce('signed-back.jpg');

      const result = await service.getJerseyOfTheDay();

      expect(result).not.toBeNull();
      expect(result!.frontImageUrl).toBe('signed-front.jpg');
      expect(result!.backImageUrl).toBe('signed-back.jpg');
      expect(result!.likesCount).toBe(3);
      expect(result!.hasLiked).toBe(false); // pas de currentUserId fourni
      expect(result!.story).toEqual(expect.any(String));
      expect(result!.story.length).toBeGreaterThan(0);
    });

    it('should fall back to the original image url if getSignedUrl returns null', async () => {
      const jersey = buildJersey();
      mockPrismaService.jersey.findMany.mockResolvedValue([jersey]);
      mockPrismaService.dailyKitNotification.create.mockResolvedValue({});
      mockR2Service.getSignedUrl.mockResolvedValue(null);

      const result = await service.getJerseyOfTheDay();

      expect(result!.frontImageUrl).toBe('front.jpg');
      expect(result!.backImageUrl).toBe('back.jpg');
    });

    it('should send a push notification only once per day (lock succeeds)', async () => {
      const jersey = buildJersey();
      mockPrismaService.jersey.findMany.mockResolvedValue([jersey]);
      mockPrismaService.dailyKitNotification.create.mockResolvedValue({});
      mockR2Service.getSignedUrl.mockResolvedValue('signed-url.jpg');

      await service.getJerseyOfTheDay();

      expect(
        mockNotificationsService.sendPushNotification,
      ).toHaveBeenCalledWith(
        'push-token-abc',
        'Kit of the Community! 🌟',
        expect.stringContaining('Arsenal'),
        { type: 'kotd', jerseyId: 'jersey-1' },
      );
    });

    it('should NOT send a push notification if the daily lock already exists', async () => {
      const jersey = buildJersey();
      mockPrismaService.jersey.findMany.mockResolvedValue([jersey]);
      // Simule une violation de contrainte unique : le verrou existe déjà pour aujourd'hui
      mockPrismaService.dailyKitNotification.create.mockRejectedValue(
        Object.assign(new Error('Unique constraint violation'), {
          code: 'P2002',
        }),
      );
      mockR2Service.getSignedUrl.mockResolvedValue('signed-url.jpg');

      const result = await service.getJerseyOfTheDay();

      // La fonction ne doit jamais planter, même si le verrou échoue
      expect(result).not.toBeNull();
      expect(
        mockNotificationsService.sendPushNotification,
      ).not.toHaveBeenCalled();
    });

    it('should NOT send a push notification if the owner has no push token', async () => {
      const jersey = buildJersey({
        user: {
          id: 'owner-id',
          username: 'thomas',
          isPublic: true,
          expoPushToken: null,
        },
      });
      mockPrismaService.jersey.findMany.mockResolvedValue([jersey]);
      mockPrismaService.dailyKitNotification.create.mockResolvedValue({});
      mockR2Service.getSignedUrl.mockResolvedValue('signed-url.jpg');

      await service.getJerseyOfTheDay();

      expect(
        mockNotificationsService.sendPushNotification,
      ).not.toHaveBeenCalled();
    });

    it('should set hasLiked to true when the current user already liked the jersey', async () => {
      const jersey = buildJersey({ likes: [{ id: 'like-1' }] });
      mockPrismaService.jersey.findMany.mockResolvedValue([jersey]);
      mockPrismaService.dailyKitNotification.create.mockResolvedValue({});
      mockR2Service.getSignedUrl.mockResolvedValue('signed-url.jpg');

      const result = await service.getJerseyOfTheDay('current-user-id');

      expect(result!.hasLiked).toBe(true);
    });
  });

  describe('toggleLike', () => {
    it('should throw an error if no userId is provided', async () => {
      await expect(service.toggleLike('jersey-1', '')).rejects.toThrow(
        'User must be logged in to like a jersey.',
      );
    });

    it('should remove the like if it already exists (unlike)', async () => {
      mockPrismaService.jerseyLike.findUnique.mockResolvedValue({
        id: 'like-1',
      });
      mockPrismaService.jerseyLike.delete.mockResolvedValue({});

      const result = await service.toggleLike('jersey-1', 'user-1');

      expect(result).toEqual({ liked: false });
      expect(mockPrismaService.jerseyLike.delete).toHaveBeenCalledWith({
        where: { jerseyId_userId: { jerseyId: 'jersey-1', userId: 'user-1' } },
      });
      // Aucune notification ne doit être envoyée lors d'un unlike
      expect(
        mockNotificationsService.sendPushNotification,
      ).not.toHaveBeenCalled();
    });

    it('should create the like and notify the jersey owner (not the liker)', async () => {
      mockPrismaService.jerseyLike.findUnique.mockResolvedValue(null);
      mockPrismaService.jerseyLike.create.mockResolvedValue({});
      mockPrismaService.jersey.findUnique.mockResolvedValue({
        id: 'jersey-1',
        userId: 'owner-id',
        club: { name: 'Arsenal' },
        user: { id: 'owner-id', expoPushToken: 'push-token-abc' },
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        username: 'alex',
      });

      const result = await service.toggleLike('jersey-1', 'liker-id');

      expect(result).toEqual({ liked: true });
      expect(
        mockNotificationsService.sendPushNotification,
      ).toHaveBeenCalledWith(
        'push-token-abc',
        'New Like! ❤️',
        expect.stringContaining('alex'),
        { type: 'like', jerseyId: 'jersey-1' },
      );
    });

    it('should NOT notify if the liker is the jersey owner (self-like)', async () => {
      mockPrismaService.jerseyLike.findUnique.mockResolvedValue(null);
      mockPrismaService.jerseyLike.create.mockResolvedValue({});
      mockPrismaService.jersey.findUnique.mockResolvedValue({
        id: 'jersey-1',
        userId: 'owner-id',
        club: { name: 'Arsenal' },
        user: { id: 'owner-id', expoPushToken: 'push-token-abc' },
      });

      const result = await service.toggleLike('jersey-1', 'owner-id'); // même id que le propriétaire

      expect(result).toEqual({ liked: true });
      expect(
        mockNotificationsService.sendPushNotification,
      ).not.toHaveBeenCalled();
    });

    it('should NOT notify if the owner has no push token', async () => {
      mockPrismaService.jerseyLike.findUnique.mockResolvedValue(null);
      mockPrismaService.jerseyLike.create.mockResolvedValue({});
      mockPrismaService.jersey.findUnique.mockResolvedValue({
        id: 'jersey-1',
        userId: 'owner-id',
        club: { name: 'Arsenal' },
        user: { id: 'owner-id', expoPushToken: null },
      });

      const result = await service.toggleLike('jersey-1', 'liker-id');

      expect(result).toEqual({ liked: true });
      expect(
        mockNotificationsService.sendPushNotification,
      ).not.toHaveBeenCalled();
    });
  });
});
