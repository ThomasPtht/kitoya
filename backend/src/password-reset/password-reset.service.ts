import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class PasswordResetService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: 'If the email exists, instructions have been sent.' };
    }

    // generate code for reset password
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

    // hash the code before storing it in the database
    const hashedCode = await bcrypt.hash(code, 10);

    const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetCode: hashedCode, resetCodeExpiry },
    });

    // send the reset code to the user's email
    await this.emailService.sendPasswordResetEmail(email, code);

    return { message: 'Instructions sent successfully' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    // Find the user by email

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !user.resetCode || !user.resetCodeExpiry) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    const isCodeValid = await bcrypt.compare(code, user.resetCode);

    if (!isCodeValid) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null,
      },
    });

    return { message: 'Password reset successfully' };
  }
}
