import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PasswordResetService } from './password-reset.service';

// 5 requests per minute per IP (see ThrottlerModule in AppModule):
// prevents reset email spam and slows down code guessing
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.passwordResetService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.passwordResetService.resetPassword(email, code, newPassword);
  }
}
