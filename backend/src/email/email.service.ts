import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendPasswordResetEmail(email: string, code: string) {
    await this.resend.emails.send({
      from: 'Kitroom <no-reply@kitroomapp.com>',
      to: email,
      subject: 'Your Kitroom Reset Code',
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Code</h2>
          <p>You requested a password reset for your Kitroom account.</p>
          <p>Here is your verification code (valid for 15 minutes):</p>
          
          <div style="background: #f4f4f4; padding: 16px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; border-radius: 8px; color: #05C785; margin: 20px 0;">
            ${code}
          </div>
          
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  }
}
