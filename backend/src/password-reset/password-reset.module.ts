import { Module } from '@nestjs/common';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [PasswordResetController],
  providers: [PasswordResetService, EmailService, PrismaService],
})
export class PasswordResetModule {}
