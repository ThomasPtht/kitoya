import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Resend } from 'resend';
import * as crypto from 'crypto';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  constructor(private prisma: PrismaService) {}

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message:
          'If an account with that email exists, a password reset email has been sent.',
      };
    }

    // generate a unique token for password reset
    const rawToken = crypto.randomBytes(32).toString('hex');

    // hash the token before storing it in the database
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // token valid for 15 minutes

    // store the token and its expiry in the database
    await this.prisma.user.update({
      where: { email },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
      },
    });

    // reinitialization link to be sent in the email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    // Send the email using Resend
    await this.resend.emails.send({
      from: 'Kitroom <onboarding@resend.dev>', // replace by verify domain email
      to: email,
      subject: 'Reset your Kitroom password',
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Password Reset</h2>
          <p>You requested a password reset for your Kitroom account.</p>
          <p>Click the link below to choose a new password:</p>
          <a href="${resetUrl}" style="background: #05C785; color: #000; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return { message: 'Instructions sent successfully' };
  }
}
