import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/feedback.dto';

// Mock the entire 'resend' module before any imports use it
const mockSend = jest.fn();

jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    })),
  };
});

describe('FeedbackService', () => {
  let service: FeedbackService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedbackService],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendFeedback', () => {
    const baseDto: CreateFeedbackDto = {
      type: 'bug',
      email: 'user@example.com',
      message: 'Something is broken',
    } as CreateFeedbackDto;

    it('should call Resend with the correct payload when userId is provided', async () => {
      mockSend.mockResolvedValueOnce({ id: 'email-id-123' });

      const result = await service.sendFeedback(baseDto, 'user-42');

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Kitroom <no-reply@kitroomapp.com>',
          to: 'hello@kitroomapp.com',
          replyTo: baseDto.email,
          subject: `[${baseDto.type}] New feedback from Kitroom`,
        }),
      );

      // Vérifie que le HTML contient bien les infos dynamiques
      const callArg = mockSend.mock.calls[0][0];
      expect(callArg.html).toContain('user-42');
      expect(callArg.html).toContain(baseDto.email);
      expect(callArg.html).toContain(baseDto.message);
      expect(callArg.html).toContain(baseDto.type);

      expect(result).toEqual({
        success: true,
        message: 'Feedback sent successfully',
      });
    });

    it('should fall back to "not logged in" when userId is not provided', async () => {
      mockSend.mockResolvedValueOnce({ id: 'email-id-456' });

      await service.sendFeedback(baseDto, undefined);

      const callArg = mockSend.mock.calls[0][0];
      expect(callArg.html).toContain('not logged in');
    });

    it('should fall back to "not provided" when no email is given in the dto', async () => {
      mockSend.mockResolvedValueOnce({ id: 'email-id-789' });

      const dtoWithoutEmail: CreateFeedbackDto = {
        type: 'suggestion',
        message: 'Would be nice to have dark mode',
      } as CreateFeedbackDto;

      await service.sendFeedback(dtoWithoutEmail, 'user-1');

      const callArg = mockSend.mock.calls[0][0];
      expect(callArg.replyTo).toBeUndefined();
      expect(callArg.html).toContain('not provided');
    });

    it('should propagate an error if Resend fails to send the email', async () => {
      mockSend.mockRejectedValueOnce(new Error('Resend API error'));

      await expect(service.sendFeedback(baseDto, 'user-42')).rejects.toThrow(
        'Resend API error',
      );
    });
  });
});
