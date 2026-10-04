import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private expo = new Expo();

  constructor(private readonly prisma: PrismaService) {}

  // 1. Update the user's expoPushToken in the database
  async saveUserToken(userId: string, expoPushToken: string) {
    // A push token identifies a device, not an account: detach it from any other
    // account first, so a device only receives notifications for the account logged in
    const [, user] = await this.prisma.$transaction([
      this.prisma.user.updateMany({
        where: { expoPushToken, id: { not: userId } },
        data: { expoPushToken: null },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { expoPushToken },
      }),
    ]);

    return user;
  }

  // Detach the device from the account on logout, so it stops receiving its notifications
  async removeUserToken(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: null },
    });
  }

  // 2. Send notification to the user
  async sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ) {
    if (!expoPushToken || !Expo.isExpoPushToken(expoPushToken)) {
      console.warn(`Skipping notification: invalid or missing token`);
      return;
    }

    const messages: ExpoPushMessage[] = [
      {
        to: expoPushToken,
        sound: 'default' as const,
        title,
        body,
        data: data || {},
      },
    ];

    try {
      await this.expo.sendPushNotificationsAsync(messages);
    } catch (error) {
      console.error('Error sending push notification', error);
    }
  }
}
