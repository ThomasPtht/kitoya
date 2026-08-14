import { Test, TestingModule } from '@nestjs/testing';
import { LockerService } from './locker.service';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';

describe('LockerService', () => {
  let service: LockerService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    jersey: {
      findMany: jest.fn(),
    },
  };

  const mockR2Service = {
    getSignedUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LockerService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: R2Service, useValue: mockR2Service },
      ],
    }).compile();

    service = module.get<LockerService>(LockerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPublicLockerByUsername', () => {
    const baseUser = {
      id: 'owner-id',
      username: 'thomas',
      isPublic: true,
      rank: 'Collector',
      location: 'Paris',
      bio: 'Jersey collector',
    };

    it('should throw if the user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.getPublicLockerByUsername('unknown'),
      ).rejects.toThrow('User not found');
    });

    it('should throw if the locker is private and the requester is not the owner', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...baseUser,
        isPublic: false,
      });

      await expect(
        service.getPublicLockerByUsername('thomas', 'someone-else-id'),
      ).rejects.toThrow('User not found or locker is private');
    });

    it('should throw if the locker is private and no requester is provided', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...baseUser,
        isPublic: false,
      });

      await expect(service.getPublicLockerByUsername('thomas')).rejects.toThrow(
        'User not found or locker is private',
      );
    });

    it('should allow the owner to view their own private locker', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...baseUser,
        isPublic: false,
      });
      mockPrismaService.jersey.findMany.mockResolvedValue([]);

      const result = await service.getPublicLockerByUsername(
        'thomas',
        'owner-id', // même id que le propriétaire
      );

      expect(result.username).toBe('thomas');
      expect(result.kitsCount).toBe(0);
    });

    it('should return jerseys with signed urls, like info, and stats for a public locker', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(baseUser);
      mockPrismaService.jersey.findMany.mockResolvedValue([
        {
          id: 'jersey-1',
          clubId: 'club-1',
          frontImageUrl: 'front1.jpg',
          backImageUrl: 'back1.jpg',
          likes: [{ userId: 'liker-1' }, { userId: 'liker-2' }],
        },
        {
          id: 'jersey-2',
          clubId: 'club-2',
          frontImageUrl: 'front2.jpg',
          backImageUrl: null,
          likes: [],
        },
      ]);
      mockR2Service.getSignedUrl.mockImplementation((key: string) =>
        Promise.resolve(`signed-${key}`),
      );

      const result = await service.getPublicLockerByUsername(
        'thomas',
        'liker-1',
      );

      expect(result.kitsCount).toBe(2);
      expect(result.clubsCount).toBe(2); // deux clubs distincts

      const [jersey1, jersey2] = result.jerseys;

      expect(jersey1.frontImageUrl).toBe('signed-front1.jpg');
      expect(jersey1.backImageUrl).toBe('signed-back1.jpg');
      expect(jersey1.likesCount).toBe(2);
      expect(jersey1.hasLiked).toBe(true); // liker-1 a bien liké ce maillot

      expect(jersey2.backImageUrl).toBeNull(); // pas d'image dos, jamais signée
      expect(jersey2.likesCount).toBe(0);
      expect(jersey2.hasLiked).toBe(false);
    });

    it('should count distinct clubs correctly even with duplicate clubs', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(baseUser);
      mockPrismaService.jersey.findMany.mockResolvedValue([
        {
          id: 'j1',
          clubId: 'club-1',
          frontImageUrl: null,
          backImageUrl: null,
          likes: [],
        },
        {
          id: 'j2',
          clubId: 'club-1',
          frontImageUrl: null,
          backImageUrl: null,
          likes: [],
        }, // même club
        {
          id: 'j3',
          clubId: 'club-2',
          frontImageUrl: null,
          backImageUrl: null,
          likes: [],
        },
      ]);

      const result = await service.getPublicLockerByUsername('thomas');

      expect(result.kitsCount).toBe(3);
      expect(result.clubsCount).toBe(2); // club-1 compté une seule fois
    });

    it('should fall back to the raw image url if R2 signing fails', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(baseUser);
      mockPrismaService.jersey.findMany.mockResolvedValue([
        {
          id: 'jersey-1',
          clubId: 'club-1',
          frontImageUrl: 'front1.jpg',
          backImageUrl: null,
          likes: [],
        },
      ]);
      mockR2Service.getSignedUrl.mockRejectedValue(new Error('R2 unavailable'));

      const result = await service.getPublicLockerByUsername('thomas');

      // La fonction ne doit jamais planter, et garder l'URL brute en fallback
      expect(result.jerseys[0].frontImageUrl).toBe('front1.jpg');
    });

    it('should set hasLiked to false when no currentUserId is provided', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(baseUser);
      mockPrismaService.jersey.findMany.mockResolvedValue([
        {
          id: 'jersey-1',
          clubId: 'club-1',
          frontImageUrl: null,
          backImageUrl: null,
          likes: [{ userId: 'someone' }],
        },
      ]);

      const result = await service.getPublicLockerByUsername('thomas'); // pas de currentUserId

      expect(result.jerseys[0].hasLiked).toBe(false);
    });
  });
});
