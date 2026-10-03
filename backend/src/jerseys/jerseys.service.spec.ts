import { Test, TestingModule } from '@nestjs/testing';
import { JerseysService } from './jerseys.service';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { FootballService } from '../search/football.service';
import { ForbiddenException } from '@nestjs/common';


describe('JerseysService', () => {
  let service: JerseysService;
  let prisma: PrismaService;

  // mock prisma service
  const mockPrismaService = {
    jersey: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockR2Service = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockFootballService = {
    searchTeams: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JerseysService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: R2Service, useValue: mockR2Service },
        { provide: FootballService, useValue: mockFootballService },
      ],
    }).compile();

    service = module.get<JerseysService>(JerseysService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // to avoid interference between tests
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteJersey', () => {
    it('should delete a jersey and its images from R2', async () => {
      const jerseyFromDb = {
        id: 'jersey-id',
        userId: 'owner-id',
        frontImageUrl: 'front.jpg',
        backImageUrl: 'back.jpg',
      };

      mockPrismaService.jersey.findUnique.mockResolvedValue(jerseyFromDb);
      mockR2Service.deleteFile.mockResolvedValue(undefined);
      mockPrismaService.jersey.delete.mockResolvedValue(jerseyFromDb);

      const result = await service.deleteJersey('jersey-id', 'owner-id');

      // check that the 2 images were deleted from R2
      expect(mockR2Service.deleteFile).toHaveBeenCalledWith('front.jpg');
      expect(mockR2Service.deleteFile).toHaveBeenCalledWith('back.jpg');
      expect(mockR2Service.deleteFile).toHaveBeenCalledTimes(2);

      // check that the jersey was deleted from the database
      expect(mockPrismaService.jersey.delete).toHaveBeenCalledWith({
        where: { id: 'jersey-id' },
      });

      expect(result).toEqual({ message: 'Jersey deleted successfully' });
    });

    it('should throw ForbiddenException if the user does not own the jersey', async () => {
      mockPrismaService.jersey.findUnique.mockResolvedValue({
        id: 'jersey-id',
        userId: 'owner-id',
        frontImageUrl: 'front.jpg',
        backImageUrl: 'back.jpg',
      });

      await expect(
        service.deleteJersey('jersey-id', 'another-user-id'),
      ).rejects.toThrow(ForbiddenException);

      // nothing should be deleted, neither in R2 nor in the database
      expect(mockR2Service.deleteFile).not.toHaveBeenCalled();
      expect(mockPrismaService.jersey.delete).not.toHaveBeenCalled();
    });
  });
});
