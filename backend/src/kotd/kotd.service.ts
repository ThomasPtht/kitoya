import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { generateJerseyStory } from './kotd-helper';
import { R2Service } from 'src/r2/r2.service';

@Injectable()
export class KotdService {
  constructor(
    private prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  async getJerseyOfTheDay(currentUserId?: string) {
    // Fetch shareable jerseys whose owner has a public profile
    const shareableJerseys = await this.prisma.jersey.findMany({
      include: {
        club: true,
        user: {
          select: {
            username: true,
            isPublic: true,
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

    if (shareableJerseys.length === 0) {
      return null;
    }

    const todayString = new Date().toISOString().slice(0, 10);
    let seed = 0;
    for (let i = 0; i < todayString.length; i++) {
      seed += todayString.charCodeAt(i);
    }
    const selectedIndex = seed % shareableJerseys.length;
    const jerseyOfTheDay = shareableJerseys[selectedIndex];

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
      return { liked: true };
    }
  }
}
