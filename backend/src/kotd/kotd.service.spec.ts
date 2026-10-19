import { Test, TestingModule } from '@nestjs/testing';
import { KotdService } from './kotd.service';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RankingsService } from '../rankings/rankings.service';

describe('KotdService', () => {
  let service: KotdService;

  const mockPrismaService = {
    jersey: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    dailyKitNotification: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    jerseyLike: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    block: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  const mockR2Service = {
    getSignedUrl: jest.fn(),
  };

  const mockNotificationsService = {
    sendPushNotification: jest.fn(),
  };

  const mockRankingsService = {
    // Not in the weekly top 3 by default; individual tests override this.
    getJerseyWeeklyRank: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KotdService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: R2Service, useValue: mockR2Service },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: RankingsService, useValue: mockRankingsService },
      ],
    }).compile();

    service = module.get<KotdService>(KotdService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockRankingsService.getJerseyWeeklyRank.mockResolvedValue(null);
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

    beforeEach(() => {
      mockPrismaService.dailyKitNotification.findMany.mockResolvedValue([
        { jerseyId: 'jersey-1' },
      ]);
    });

    it('should return null if no kit has been picked yet', async () => {
      mockPrismaService.dailyKitNotification.findMany.mockResolvedValue([]);

      const result = await service.getJerseyOfTheDay();

      expect(result).toBeNull();
    });

    it('should return the selected jersey enriched with story, signed urls, and like info', async () => {
      const jersey = buildJersey();
      mockPrismaService.jersey.findUnique.mockResolvedValue(jersey);
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
      mockPrismaService.jersey.findUnique.mockResolvedValue(jersey);
      mockR2Service.getSignedUrl.mockResolvedValue(null);

      const result = await service.getJerseyOfTheDay();

      expect(result!.frontImageUrl).toBe('front.jpg');
      expect(result!.backImageUrl).toBe('back.jpg');
    });

    it('should fall back to the previous pick when the latest jersey was deleted', async () => {
      mockPrismaService.dailyKitNotification.findMany.mockResolvedValue([
        { jerseyId: 'deleted-jersey' },
        { jerseyId: 'jersey-1' },
      ]);
      mockPrismaService.jersey.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(buildJersey());
      mockR2Service.getSignedUrl.mockResolvedValue('signed-url.jpg');

      const result = await service.getJerseyOfTheDay();

      expect(result!.id).toBe('jersey-1');
    });

    it('should never pick a kit or send a notification (the daily job does)', async () => {
      mockPrismaService.jersey.findUnique.mockResolvedValue(buildJersey());
      mockR2Service.getSignedUrl.mockResolvedValue('signed-url.jpg');

      await service.getJerseyOfTheDay();

      expect(
        mockPrismaService.dailyKitNotification.create,
      ).not.toHaveBeenCalled();
      expect(
        mockNotificationsService.sendPushNotification,
      ).not.toHaveBeenCalled();
    });

    it('should set hasLiked to true when the current user already liked the jersey', async () => {
      const jersey = buildJersey({ likes: [{ id: 'like-1' }] });
      mockPrismaService.jersey.findUnique.mockResolvedValue(jersey);
      mockR2Service.getSignedUrl.mockResolvedValue('signed-url.jpg');

      const result = await service.getJerseyOfTheDay('current-user-id');

      expect(result!.hasLiked).toBe(true);
    });

    it('should return null when the owner of the kit is blocked by the viewer', async () => {
      const jersey = buildJersey();
      mockPrismaService.jersey.findUnique.mockResolvedValue(jersey);
      mockPrismaService.block.findMany.mockResolvedValueOnce([
        { blockerId: 'current-user-id', blockedId: jersey.user.id },
      ]);

      const result = await service.getJerseyOfTheDay('current-user-id');

      expect(result).toBeNull();
    });
  });

  describe('ensureKitOfTheDay', () => {
    const owner = (overrides = {}) => ({
      expoPushToken: 'push-token-abc',
      language: 'en',
      ...overrides,
    });

    beforeEach(() => {
      mockPrismaService.dailyKitNotification.findFirst.mockResolvedValue(null);
      mockPrismaService.dailyKitNotification.create.mockResolvedValue({});
      mockPrismaService.jersey.findMany.mockResolvedValue([
        { id: 'jersey-1', user: { id: 'owner-id' } },
      ]);
      mockPrismaService.jersey.findUnique.mockResolvedValue({
        id: 'jersey-1',
        club: { name: 'Arsenal' },
        user: owner(),
      });
    });

    it('picks a kit, records it for the day and notifies its owner', async () => {
      await service.ensureKitOfTheDay('2026-10-19');

      expect(
        mockPrismaService.dailyKitNotification.create,
      ).toHaveBeenCalledWith({
        data: { jerseyId: 'jersey-1', date: '2026-10-19' },
      });
      expect(
        mockNotificationsService.sendPushNotification,
      ).toHaveBeenCalledWith(
        'push-token-abc',
        'Kit of the Community! 🌟',
        expect.stringContaining('Arsenal'),
        { type: 'kotd', jerseyId: 'jersey-1' },
      );
    });

    it("notifies in the owner's language", async () => {
      mockPrismaService.jersey.findUnique.mockResolvedValue({
        id: 'jersey-1',
        club: { name: 'Arsenal' },
        user: owner({ language: 'fr' }),
      });

      await service.ensureKitOfTheDay('2026-10-19');

      expect(
        mockNotificationsService.sendPushNotification,
      ).toHaveBeenCalledWith(
        'push-token-abc',
        'Maillot de la communauté ! 🌟',
        expect.any(String),
        expect.any(Object),
      );
    });

    it('does nothing when the kit of the day was already picked', async () => {
      mockPrismaService.dailyKitNotification.findFirst.mockResolvedValue({
        id: 'pick-1',
      });

      await service.ensureKitOfTheDay('2026-10-19');

      expect(mockPrismaService.jersey.findMany).not.toHaveBeenCalled();
      expect(
        mockNotificationsService.sendPushNotification,
      ).not.toHaveBeenCalled();
    });

    it('does not notify twice when a concurrent run already took the lock', async () => {
      mockPrismaService.dailyKitNotification.create.mockRejectedValue(
        Object.assign(new Error('Unique constraint violation'), {
          code: 'P2002',
        }),
      );

      await service.ensureKitOfTheDay('2026-10-19');

      expect(
        mockNotificationsService.sendPushNotification,
      ).not.toHaveBeenCalled();
    });

    it('does nothing when there are no jerseys at all', async () => {
      mockPrismaService.jersey.findMany.mockResolvedValue([]);

      await service.ensureKitOfTheDay('2026-10-19');

      expect(
        mockPrismaService.dailyKitNotification.create,
      ).not.toHaveBeenCalled();
    });

    it('does not notify when the owner has no push token', async () => {
      mockPrismaService.jersey.findUnique.mockResolvedValue({
        id: 'jersey-1',
        club: { name: 'Arsenal' },
        user: owner({ expoPushToken: null }),
      });

      await service.ensureKitOfTheDay('2026-10-19');

      expect(
        mockNotificationsService.sendPushNotification,
      ).not.toHaveBeenCalled();
    });

    it('still records the pick when the push fails', async () => {
      mockNotificationsService.sendPushNotification.mockRejectedValueOnce(
        new Error('Expo down'),
      );
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      await expect(
        service.ensureKitOfTheDay('2026-10-19'),
      ).resolves.toBeUndefined();
      expect(mockPrismaService.dailyKitNotification.create).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
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

  describe('toggleLike — weekly top 3 notification', () => {
    const buildLikedJersey = (overrides = {}) => ({
      id: 'jersey-1',
      userId: 'owner-id',
      club: { name: 'Arsenal' },
      lastTopWeeklyNotifiedAt: null,
      user: {
        id: 'owner-id',
        expoPushToken: 'push-token-abc',
        language: 'en',
      },
      ...overrides,
    });

    beforeEach(() => {
      mockPrismaService.jerseyLike.findUnique.mockResolvedValue(null);
      mockPrismaService.jerseyLike.create.mockResolvedValue({});
      mockPrismaService.jersey.update.mockResolvedValue({});
    });

    it('notifies the owner when the jersey just entered the weekly top 3', async () => {
      mockPrismaService.jersey.findUnique.mockResolvedValue(buildLikedJersey());
      mockRankingsService.getJerseyWeeklyRank.mockResolvedValue(2);

      await service.toggleLike('jersey-1', 'liker-id');

      expect(mockRankingsService.getJerseyWeeklyRank).toHaveBeenCalledWith(
        'jersey-1',
        3,
      );
      expect(mockPrismaService.jersey.update).toHaveBeenCalledWith({
        where: { id: 'jersey-1' },
        data: { lastTopWeeklyNotifiedAt: expect.any(Date) },
      });
      expect(
        mockNotificationsService.sendPushNotification,
      ).toHaveBeenCalledWith(
        'push-token-abc',
        "You're on the podium! 🏆",
        expect.stringContaining('Arsenal'),
        { type: 'top_weekly', jerseyId: 'jersey-1', rank: '2' },
      );
    });

    it('does NOT notify when the jersey is outside the weekly top 3', async () => {
      mockPrismaService.jersey.findUnique.mockResolvedValue(buildLikedJersey());
      mockRankingsService.getJerseyWeeklyRank.mockResolvedValue(null);

      // Self-like, so we only exercise the top-3 path (no separate "New Like" push).
      await service.toggleLike('jersey-1', 'owner-id');

      expect(mockPrismaService.jersey.update).not.toHaveBeenCalled();
      expect(
        mockNotificationsService.sendPushNotification,
      ).not.toHaveBeenCalled();
    });

    it('does NOT re-notify while the cooldown has not elapsed', async () => {
      mockPrismaService.jersey.findUnique.mockResolvedValue(
        buildLikedJersey({
          lastTopWeeklyNotifiedAt: new Date(), // just notified
        }),
      );

      // Self-like, so we only exercise the top-3 path (no separate "New Like" push).
      await service.toggleLike('jersey-1', 'owner-id');

      expect(mockRankingsService.getJerseyWeeklyRank).not.toHaveBeenCalled();
      expect(mockPrismaService.jersey.update).not.toHaveBeenCalled();
      expect(
        mockNotificationsService.sendPushNotification,
      ).not.toHaveBeenCalled();
    });

    it('re-notifies once the cooldown has elapsed', async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      mockPrismaService.jersey.findUnique.mockResolvedValue(
        buildLikedJersey({ lastTopWeeklyNotifiedAt: twoDaysAgo }),
      );
      mockRankingsService.getJerseyWeeklyRank.mockResolvedValue(1);

      await service.toggleLike('jersey-1', 'liker-id');

      expect(
        mockNotificationsService.sendPushNotification,
      ).toHaveBeenCalledWith(
        'push-token-abc',
        "You're on the podium! 🏆",
        expect.stringContaining('Arsenal'),
        { type: 'top_weekly', jerseyId: 'jersey-1', rank: '1' },
      );
    });

    it('does NOT crash toggleLike if the weekly rank lookup throws', async () => {
      mockPrismaService.jersey.findUnique.mockResolvedValue(buildLikedJersey());
      mockRankingsService.getJerseyWeeklyRank.mockRejectedValue(
        new Error('DB unavailable'),
      );

      const result = await service.toggleLike('jersey-1', 'liker-id');

      expect(result).toEqual({ liked: true });
    });
  });
});
