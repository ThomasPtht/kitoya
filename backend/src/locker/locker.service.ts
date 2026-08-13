import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { R2Service } from 'src/r2/r2.service';

@Injectable()
export class LockerService {
  constructor(
    private prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  async getPublicLockerByUsername(username: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        isPublic: true,
        rank: true,
        location: true,
        bio: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if the current user is the owner of the locker
    const isOwner = currentUserId && currentUserId === user.id;

    // if locker is private and the current user is not the owner, throw an error
    if (!user.isPublic && !isOwner) {
      throw new Error('User not found or locker is private');
    }

    const jerseys = await this.prisma.jersey.findMany({
      where: { userId: user.id },
      include: {
        sport: true,
        club: true,
        likes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedJerseys = await Promise.all(
      jerseys.map(async (jersey) => {
        // Force the type of frontImageUrl and backImageUrl to be string | null
        let frontImageUrl: string | null = jersey.frontImageUrl;
        let backImageUrl: string | null = jersey.backImageUrl;

        try {
          if (jersey.frontImageUrl) {
            frontImageUrl = await this.r2Service.getSignedUrl(
              jersey.frontImageUrl!,
            );
          }
          if (jersey.backImageUrl) {
            backImageUrl = await this.r2Service.getSignedUrl(
              jersey.backImageUrl!,
            );
          }
        } catch (error) {
          console.error(
            `Erreur lors de la signature R2 pour le maillot ${jersey.id}:`,
            error,
          );
        }

        return {
          ...jersey,
          frontImageUrl,
          backImageUrl,
          likesCount: jersey.likes.length,
          hasLiked: currentUserId
            ? jersey.likes.some((like) => like.userId === currentUserId)
            : false,
        };
      }),
    );

    // Statistics
    const kitsCount = jerseys.length;
    const uniqueClubs = new Set(jerseys.map((j) => j.clubId)).size;

    return {
      ...user,
      kitsCount,
      clubsCount: uniqueClubs,
      jerseys: formattedJerseys,
    };
  }
}
