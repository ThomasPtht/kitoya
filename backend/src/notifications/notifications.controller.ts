import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// Importe ton guard d'authentification ici (ex: JwtAuthGuard)

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
}
