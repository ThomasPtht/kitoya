import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

describe('PasswordResetService', () => {
  let service: PasswordResetService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockEmailService = {
    sendPasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('forgotPassword', () => {
    it('should return a generic message without sending an email if the user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('unknown@example.com');

      expect(result).toEqual({
        message: 'If the email exists, instructions have been sent.',
      });

      // anti enumeration: dont send email or update DB if user doesn't exist
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should generate a code, store its hash, and send the reset email', async () => {
      const userFromDb = {
        id: 'user-id',
        email: 'thomas@example.com',
        language: 'fr',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(userFromDb);
      mockPrismaService.user.update.mockResolvedValue(userFromDb);

      const result = await service.forgotPassword('thomas@example.com');

      expect(result).toEqual({ message: 'Instructions sent successfully' });

      // Check that the reset code was hashed and stored in the database
      const updateCallArgs = mockPrismaService.user.update.mock.calls[0][0];
      const [, sentCode] =
        mockEmailService.sendPasswordResetEmail.mock.calls[0];

      expect(sentCode).toMatch(/^\d{6}$/); // Check that the code is a 6-digit number

      const isCodeHashCorrect = await bcrypt.compare(
        sentCode,
        updateCallArgs.data.resetCode,
      );
      expect(isCodeHashCorrect).toBe(true);

      // a new code starts with a fresh attempts counter
      expect(updateCallArgs.data.resetCodeAttempts).toBe(0);

      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'thomas@example.com',
        sentCode,
        'fr',
      );
    });
  });

  describe('resetPassword', () => {
    const email = 'thomas@example.com';
    const validCode = '123456';

    beforeEach(() => {
      // by default an attempt is still available on the code
      mockPrismaService.user.updateMany.mockResolvedValue({ count: 1 });
    });

    it('should wipe the code and throw once the max attempts are reached, even with the right code', async () => {
      const hashedCode = await bcrypt.hash(validCode, 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        resetCode: hashedCode,
        resetCodeExpiry: new Date(Date.now() + 10 * 60 * 1000),
        resetCodeAttempts: 5,
      });
      mockPrismaService.user.updateMany.mockResolvedValue({ count: 0 }); // no attempt left

      await expect(
        service.resetPassword(email, validCode, 'newPassword123'),
      ).rejects.toThrow('Invalid or expired reset code');

      // the code is wiped, the password is untouched
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { resetCode: null, resetCodeExpiry: null, resetCodeAttempts: 0 },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(1);
    });

    it('should count an attempt before comparing the code', async () => {
      const hashedCode = await bcrypt.hash(validCode, 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        resetCode: hashedCode,
        resetCodeExpiry: new Date(Date.now() + 10 * 60 * 1000),
        resetCodeAttempts: 2,
      });

      await expect(
        service.resetPassword(email, 'wrongCode', 'newPassword123'),
      ).rejects.toThrow('Invalid or expired reset code');

      expect(mockPrismaService.user.updateMany).toHaveBeenCalledWith({
        where: { id: 'user-id', resetCodeAttempts: { lt: 5 } },
        data: { resetCodeAttempts: { increment: 1 } },
      });
    });

    it('should throw BadRequestException if the user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.resetPassword(email, validCode, 'newPassword123'),
      ).rejects.toThrow('Invalid or expired reset code');
    });

    it('should throw BadRequestException if no reset code was ever requested', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        resetCode: null,
        resetCodeExpiry: null,
      });

      await expect(
        service.resetPassword(email, validCode, 'newPassword123'),
      ).rejects.toThrow('Invalid or expired reset code');
    });

    it('should throw BadRequestException if the provided code does not match', async () => {
      const hashedCode = await bcrypt.hash(validCode, 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        resetCode: hashedCode,
        resetCodeExpiry: new Date(Date.now() + 10 * 60 * 1000),
      });

      await expect(
        service.resetPassword(email, 'wrongCode', 'newPassword123'),
      ).rejects.toThrow('Invalid or expired reset code');

      //  password should not be updated if the code is invalid
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if the code has expired, even if it matches', async () => {
      const hashedCode = await bcrypt.hash(validCode, 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        resetCode: hashedCode,
        resetCodeExpiry: new Date(Date.now() - 60 * 1000), // expired 1 min ago
      });

      await expect(
        service.resetPassword(email, validCode, 'newPassword123'),
      ).rejects.toThrow('Invalid or expired reset code');

      // password should not be updated if the code is expired
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should reset the password and clear the reset code on success', async () => {
      const hashedCode = await bcrypt.hash(validCode, 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        resetCode: hashedCode,
        resetCodeExpiry: new Date(Date.now() + 10 * 60 * 1000),
      });
      mockPrismaService.user.update.mockResolvedValue({});

      const newPassword = 'newSecurePassword456';
      const result = await service.resetPassword(email, validCode, newPassword);

      expect(result).toEqual({ message: 'Password reset successfully' });

      const updateCallArgs = mockPrismaService.user.update.mock.calls[0][0];

      // new password should be hashed before storing in the database
      const isNewPasswordHashed = await bcrypt.compare(
        newPassword,
        updateCallArgs.data.password,
      );
      expect(isNewPasswordHashed).toBe(true);

      // reset code and expiry should be cleared after successful password reset
      expect(updateCallArgs.data.resetCode).toBeNull();
      expect(updateCallArgs.data.resetCodeExpiry).toBeNull();
      expect(updateCallArgs.data.resetCodeAttempts).toBe(0);
    });
  });
});
