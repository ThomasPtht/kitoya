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
      const userFromDb = { id: 'user-id', email: 'thomas@example.com' };
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

      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'thomas@example.com',
        sentCode,
      );
    });
  });

  describe('resetPassword', () => {
    const email = 'thomas@example.com';
    const validCode = '123456';

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
    });
  });
});
