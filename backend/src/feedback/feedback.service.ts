import { Injectable } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/feedback.dto';
import { Resend } from 'resend';

@Injectable()
export class FeedbackService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendFeedback(dto: CreateFeedbackDto, userId?: string) {
    await this.resend.emails.send({
      from: 'Kitoya <no-reply@kitoya.com>',
      to: 'hello@kitoya.com',
      replyTo: dto.email, // to allow direct replies to the user if they provided an email
      subject: `[${dto.type}] New feedback from Kitoya`,
      html: `
        <p><strong>Type:</strong> ${dto.type}</p>
        <p><strong>User ID:</strong> ${userId ?? 'not logged in'}</p>
        <p><strong>Reply to:</strong> ${dto.email ?? 'not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${dto.message}</p>
      `,
    });
    return {
      success: true,
      message: 'Feedback sent successfully',
    };
  }
}
