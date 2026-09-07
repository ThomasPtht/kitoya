import { Test, TestingModule } from '@nestjs/testing';
import { SportsService } from './sports.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SportsService', () => {
  let service: SportsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    sport: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SportsService>(SportsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
