import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private expo = new Expo();

  constructor(private readonly prisma: PrismaService) {}

  // 1. Update the user's expoPushToken in the database
  async saveUserToken(userId: string, expoPushToken: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { expoPushToken },
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
      console.log(`Skipping notification: invalid or missing token`);
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
      const ticketChunk = await this.expo.sendPushNotificationsAsync(messages);
      console.log('Notification sent successfully:', ticketChunk);
    } catch (error) {
      console.error('Error sending push notification', error);
    }
  }
}
