import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    // run the batched operations like Prisma does and return their results
    $transaction: jest.fn((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveUserToken', () => {
    it('should update the user token', async () => {
      const userId = 'user-123';
      const token = 'ExponentPushToken[xxxxxx]';

      mockPrismaService.user.update.mockResolvedValueOnce({
        id: userId,
        expoPushToken: token,
      });

      const result = await service.saveUserToken(userId, token);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { expoPushToken: token },
      });
      expect(result.expoPushToken).toBe(token);
    });

    it('should detach the token from any other account using the same device', async () => {
      const userId = 'user-123';
      const token = 'ExponentPushToken[xxxxxx]';

      mockPrismaService.user.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrismaService.user.update.mockResolvedValueOnce({
        id: userId,
        expoPushToken: token,
      });

      await service.saveUserToken(userId, token);

      expect(mockPrismaService.user.updateMany).toHaveBeenCalledWith({
        where: { expoPushToken: token, id: { not: userId } },
        data: { expoPushToken: null },
      });
      // both writes happen in the same transaction
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeUserToken', () => {
    it('should clear the push token of the user', async () => {
      mockPrismaService.user.update.mockResolvedValueOnce({});

      await service.removeUserToken('user-123');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { expoPushToken: null },
      });
    });
  });
});
