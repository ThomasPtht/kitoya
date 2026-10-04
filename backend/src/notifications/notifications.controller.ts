import { Controller, Post, Delete, Body, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('save-token')
  @UseGuards(JwtAuthGuard)
  async saveToken(@Req() req, @Body() body: { expoPushToken: string }) {
    const userId = req.user?.userId;
    const { expoPushToken } = body;

    await this.notificationsService.saveUserToken(userId, expoPushToken);

    return { success: true };
  }

  // Called by the app on logout, before the JWT is deleted
  @Delete('token')
  @UseGuards(JwtAuthGuard)
  async removeToken(@Req() req) {
    await this.notificationsService.removeUserToken(req.user.userId);

    return { success: true };
  }
}
