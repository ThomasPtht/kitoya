import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      update: jest.fn(),
    },
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
  });
});
