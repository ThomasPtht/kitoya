import { Controller, Post, Body } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';

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
