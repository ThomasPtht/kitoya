import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: jest.fn().mockResolvedValue({}) },
  })),
}));

describe('ModerationService', () => {
  let service: ModerationService;

  const mockPrismaService = {
    user: { findUnique: jest.fn() },
    jersey: { findUnique: jest.fn() },
    report: { create: jest.fn() },
    block: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModerationService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ModerationService>(ModerationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReport', () => {
    it('should report a user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'bad-user' });
      mockPrismaService.report.create.mockResolvedValue({ id: 'report-1' });

      const result = await service.createReport('reporter', {
        targetType: 'USER',
        targetId: 'bad-user',
        reason: 'SPAM',
      });

      expect(result).toEqual({ success: true });
      expect(mockPrismaService.report.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          reporterId: 'reporter',
          targetType: 'USER',
          reportedUserId: 'bad-user',
          reason: 'SPAM',
        }),
      });
    });

    it('should attach a jersey report to the jersey owner', async () => {
      mockPrismaService.jersey.findUnique.mockResolvedValue({
        userId: 'owner',
      });
      mockPrismaService.report.create.mockResolvedValue({ id: 'report-2' });

      await service.createReport('reporter', {
        targetType: 'JERSEY',
        targetId: 'jersey-1',
        reason: 'INAPPROPRIATE',
        details: 'offensive picture',
      });

      expect(mockPrismaService.report.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          targetId: 'jersey-1',
          reportedUserId: 'owner',
          details: 'offensive picture',
        }),
      });
    });

    it('should throw if the target does not exist', async () => {
      mockPrismaService.jersey.findUnique.mockResolvedValue(null);

      await expect(
        service.createReport('reporter', {
          targetType: 'JERSEY',
          targetId: 'missing',
          reason: 'SPAM',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not allow reporting yourself', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'me' });

      await expect(
        service.createReport('me', {
          targetType: 'USER',
          targetId: 'me',
          reason: 'SPAM',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.report.create).not.toHaveBeenCalled();
    });
  });

  describe('blockUser', () => {
    it('should block a user idempotently', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'other' });

      const result = await service.blockUser('me', 'other');

      expect(result).toEqual({ blocked: true });
      expect(mockPrismaService.block.upsert).toHaveBeenCalledWith({
        where: { blockerId_blockedId: { blockerId: 'me', blockedId: 'other' } },
        create: { blockerId: 'me', blockedId: 'other' },
        update: {},
      });
    });

    it('should not allow blocking yourself', async () => {
      await expect(service.blockUser('me', 'me')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if the user to block does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.blockUser('me', 'ghost')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unblockUser', () => {
    it('should remove the block', async () => {
      const result = await service.unblockUser('me', 'other');

      expect(result).toEqual({ blocked: false });
      expect(mockPrismaService.block.deleteMany).toHaveBeenCalledWith({
        where: { blockerId: 'me', blockedId: 'other' },
      });
    });
  });
});
