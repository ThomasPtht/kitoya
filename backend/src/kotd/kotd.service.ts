import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { generateJerseyStory } from './kotd-helper';
import { R2Service } from 'src/r2/r2.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class KotdService {
  constructor(
    private prisma: PrismaService,
    private readonly r2Service: R2Service,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getJerseyOfTheDay(currentUserId?: string) {
    // Fetch shareable jerseys whose owner has a public profile
    const allJerseys = await this.prisma.jersey.findMany({
      include: {
        club: true,
        user: {
          select: {
            id: true, // identify the user who owns the jersey
            username: true,
            isPublic: true,
            expoPushToken: true, // to send notifications if needed
          },
        },
        _count: {
          select: { likes: true },
        },
        ...(currentUserId
          ? {
              likes: {
                where: { userId: currentUserId },
                select: { id: true },
              },
            }
          : {}),
      },
    });

    if (allJerseys.length === 0) {
      return null;
    }

    const todayString = new Date().toISOString().slice(0, 10);
    let seed = 0;
    for (let i = 0; i < todayString.length; i++) {
      seed += todayString.charCodeAt(i);
    }
    const selectedIndex = seed % allJerseys.length;
    const jerseyOfTheDay = allJerseys[selectedIndex];

    if (jerseyOfTheDay.user.expoPushToken) {
      await this.notificationsService.sendPushNotification(
        jerseyOfTheDay.user.expoPushToken,
        'Kit of the Community! 🌟',
        `Your ${jerseyOfTheDay.club.name} jersey has been selected today!`,
        { type: 'kotd', jerseyId: jerseyOfTheDay.id },
      );
    }

    const story = generateJerseyStory({
      clubName: jerseyOfTheDay.club.name,
      season: jerseyOfTheDay.season as string,
      type: jerseyOfTheDay.type,
      version: jerseyOfTheDay.version,
      playerName: jerseyOfTheDay.playerName,
    });

    const [frontImageUrl, backImageUrl] = await Promise.all([
      this.r2Service.getSignedUrl(jerseyOfTheDay.frontImageUrl),
      this.r2Service.getSignedUrl(jerseyOfTheDay.backImageUrl),
    ]);

    return {
      ...jerseyOfTheDay,
      frontImageUrl: frontImageUrl ?? jerseyOfTheDay.frontImageUrl,
      backImageUrl: backImageUrl ?? jerseyOfTheDay.backImageUrl,
      story,
      likesCount: jerseyOfTheDay._count.likes,
      hasLiked: currentUserId
        ? (jerseyOfTheDay as any).likes?.length > 0
        : false,
    };
  }

  async toggleLike(jerseyId: string, userId: string) {
    if (!userId) {
      throw new Error('User must be logged in to like a jersey.');
    }

    const existingLike = await this.prisma.jerseyLike.findUnique({
      where: {
        jerseyId_userId: {
          jerseyId,
          userId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.jerseyLike.delete({
        where: {
          jerseyId_userId: {
            jerseyId,
            userId,
          },
        },
      });
      return { liked: false };
    } else {
      await this.prisma.jerseyLike.create({
        data: {
          jerseyId,
          userId,
        },
      });

      //get the jersey to check if the owner has a push token and avoid to send a notification to the liker if they are the owner
      const jersey = await this.prisma.jersey.findUnique({
        where: { id: jerseyId },
        include: {
          club: true,
          user: { select: { id: true, expoPushToken: true, username: true } },
        },
      });

      // if the jersey belongs to other user and they have a push token, send a notification
      if (jersey && jersey.userId !== userId && jersey.user.expoPushToken) {
        // Get the username of the liker to include in the notification message
        const liker = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { username: true },
        });

        const likerName = liker?.username || 'Someone';

        await this.notificationsService.sendPushNotification(
          jersey.user.expoPushToken,
          'New Like! ❤️',
          `${likerName} liked your ${jersey.club.name} shirt!`,
          { type: 'like', jerseyId: jersey.id },
        );
      }

      return { liked: true };
    }
  }
}
