import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { getHiddenUserIds } from '../moderation/blocks.helper';

const DEFAULT_LIMIT = 10;
// Over-fetch candidates since some may belong to hidden/blocked owners and get filtered out.
const CANDIDATE_BUFFER_MULTIPLIER = 3;

@Injectable()
export class RankingsService {
  constructor(
    private prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  async getWeeklyRankings(limit: number = DEFAULT_LIMIT, currentUserId?: string) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Aggregate likes received per jersey over the last 7 rolling days.
    const grouped = await this.prisma.jerseyLike.groupBy({
      by: ['jerseyId'],
      where: { createdAt: { gte: since } },
      _count: { jerseyId: true },
      orderBy: { _count: { jerseyId: 'desc' } },
      take: limit * CANDIDATE_BUFFER_MULTIPLIER,
    });

    if (grouped.length === 0) {
      return [];
    }

    const likesByJerseyId = new Map(
      grouped.map((g) => [g.jerseyId, g._count.jerseyId]),
    );

    const jerseys = await this.prisma.jersey.findMany({
      where: { id: { in: grouped.map((g) => g.jerseyId) } },
      include: {
        club: true,
        user: {
          select: { id: true, username: true, isPublic: true },
        },
      },
    });

    // A jersey whose owner blocked (or was blocked by) the viewer is simply left out of the rankings.
    const hiddenUserIds = await getHiddenUserIds(this.prisma, currentUserId);

    const ranked = jerseys
      .filter((jersey) => !hiddenUserIds.includes(jersey.user.id))
      .sort(
        (a, b) =>
          (likesByJerseyId.get(b.id) ?? 0) - (likesByJerseyId.get(a.id) ?? 0),
      )
      .slice(0, limit);

    return Promise.all(
      ranked.map(async (jersey, index) => {
        let frontImageUrl: string | null = jersey.frontImageUrl;
        let backImageUrl: string | null = jersey.backImageUrl;

        try {
          if (jersey.frontImageUrl) {
            frontImageUrl = await this.r2Service.getSignedUrl(
              jersey.frontImageUrl,
            );
          }
          if (jersey.backImageUrl) {
            backImageUrl = await this.r2Service.getSignedUrl(
              jersey.backImageUrl,
            );
          }
        } catch (error) {
          console.error(
            `Erreur lors de la signature R2 pour le maillot ${jersey.id}:`,
            error,
          );
        }

        return {
          rank: index + 1,
          likesCount: likesByJerseyId.get(jersey.id) ?? 0,
          jersey: {
            id: jersey.id,
            frontImageUrl,
            backImageUrl,
            season: jersey.season,
            type: jersey.type,
            version: jersey.version,
            club: {
              name: jersey.club.name,
              logoUrl: jersey.club.logoUrl,
            },
          },
          owner: {
            username: jersey.user.username,
            isPublic: jersey.user.isPublic,
          },
        };
      }),
    );
  }
}
