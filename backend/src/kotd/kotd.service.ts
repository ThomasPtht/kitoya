import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateJerseyStory } from './kotd-helper';
import { R2Service } from '../r2/r2.service';
import { NotificationsService } from '../notifications/notifications.service';
import { getHiddenUserIds } from '../moderation/blocks.helper';
import { RankingsService } from '../rankings/rankings.service';

// A jersey newly entering the weekly top 3 won't be re-notified more than
// once within this window, even if it oscillates around the #3 boundary as
// likes come in and roll out of the 7-day window.
const TOP_WEEKLY_NOTIFICATION_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const TOP_WEEKLY_RANK_THRESHOLD = 3;

const TRANSLATIONS = {
  en: {
    types: {
      HOME: 'home',
      AWAY: 'away',
      THIRD: 'third',
      FOURTH: 'fourth',
      GOALKEEPER: 'goalkeeper',
      SPECIAL: 'special',
      TRAINING: 'training',
    },
    versions: {
      REPLICA: 'replica',
      AUTHENTIC: 'authentic',
      FAN: 'fan',
      PLAYER_ISSUE: 'player issue',
      MATCH_WORN: 'match worn',
    },
    notifications: {
      kotdTitle: 'Kit of the Community! 🌟',
      kotdBody: (clubName: string) =>
        `Your ${clubName} jersey has been selected today!`,
      likeTitle: 'New Like! ❤️',
      likeBody: (likerName: string, clubName: string) =>
        `${likerName} liked your ${clubName} shirt!`,
      topWeeklyTitle: "You're on the podium! 🏆",
      topWeeklyBody: (rank: number, clubName: string) =>
        `Your ${clubName} shirt is #${rank} in this week's rankings!`,
    },
  },
  fr: {
    types: {
      HOME: 'domicile',
      AWAY: 'extérieur',
      THIRD: 'third',
      FOURTH: 'fourth',
      GOALKEEPER: 'gardien',
      SPECIAL: 'spécial',
      TRAINING: 'entraînement',
    },
    versions: {
      REPLICA: 'replica',
      AUTHENTIC: 'authentique',
      PLAYER_ISSUE: 'version pro',
      MATCH_WORN: 'porté en match',
    },
    notifications: {
      kotdTitle: 'Maillot de la communauté ! 🌟',
      kotdBody: (clubName: string) =>
        `Votre maillot ${clubName} a été sélectionné aujourd'hui !`,
      likeTitle: "Nouveau j'aime ! ❤️",
      likeBody: (likerName: string, clubName: string) =>
        `${likerName} a aimé votre maillot ${clubName} !`,
      topWeeklyTitle: 'Vous êtes sur le podium ! 🏆',
      topWeeklyBody: (rank: number, clubName: string) =>
        `Votre maillot ${clubName} est #${rank} du classement de la semaine !`,
    },
  },
  es: {
    types: {
      HOME: 'local',
      AWAY: 'visitante',
      THIRD: 'tercera',
      FOURTH: 'cuarta',
      GOALKEEPER: 'portero',
      SPECIAL: 'especial',
      TRAINING: 'entrenamiento',
    },
    versions: {
      REPLICA: 'réplica',
      AUTHENTIC: 'auténtica',
      PLAYER_ISSUE: 'versión jugador',
      MATCH_WORN: 'usada en partido',
    },
    notifications: {
      kotdTitle: '¡Kit de la comunidad! 🌟',
      kotdBody: (clubName: string) =>
        `¡Tu camiseta del ${clubName} ha sido seleccionada hoy!`,
      likeTitle: '¡Nuevo me gusta! ❤️',
      likeBody: (likerName: string, clubName: string) =>
        `¡A ${likerName} le gustó tu camiseta del ${clubName}!`,
      topWeeklyTitle: '¡Estás en el podio! 🏆',
      topWeeklyBody: (rank: number, clubName: string) =>
        `¡Tu camiseta del ${clubName} es #${rank} en la clasificación de esta semana!`,
    },
  },
};

@Injectable()
export class KotdService {
  constructor(
    private prisma: PrismaService,
    private readonly r2Service: R2Service,
    private readonly notificationsService: NotificationsService,
    private readonly rankingsService: RankingsService,
  ) {}

  async getJerseyOfTheDay(
    currentUserId?: string,
    locale: 'en' | 'fr' | 'es' = 'en',
  ) {
    const allJerseys = await this.prisma.jersey.findMany({
      include: {
        club: true,
        user: {
          select: {
            id: true,
            username: true,
            isPublic: true,
            expoPushToken: true,
            language: true, // langue du propriétaire du maillot
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

    // The kit of the day is the same for everyone: a viewer who blocked its owner
    // (or was blocked by them) just doesn't see it.
    const hiddenUserIds = await getHiddenUserIds(this.prisma, currentUserId);
    if (hiddenUserIds.includes(jerseyOfTheDay.user.id)) {
      return null;
    }

    try {
      await this.prisma.dailyKitNotification.create({
        data: {
          jerseyId: jerseyOfTheDay.id,
          date: todayString,
        },
      });

      if (jerseyOfTheDay.user.expoPushToken) {
        // Utilise la langue du DESTINATAIRE (propriétaire du maillot), pas du visiteur
        const recipientLocale =
          (jerseyOfTheDay.user.language as 'en' | 'fr' | 'es') || 'en';
        const notifTranslations =
          TRANSLATIONS[recipientLocale]?.notifications ||
          TRANSLATIONS.en.notifications;

        await this.notificationsService.sendPushNotification(
          jerseyOfTheDay.user.expoPushToken,
          notifTranslations.kotdTitle,
          notifTranslations.kotdBody(jerseyOfTheDay.club.name),
          { type: 'kotd', jerseyId: jerseyOfTheDay.id },
        );
      }
    } catch (error) {
      console.error(
        'DailyKitNotification lock creation failed (likely already exists today):',
        error,
      );
    }

    const tTypes = TRANSLATIONS[locale]?.types || TRANSLATIONS.en.types;
    const tVersions =
      TRANSLATIONS[locale]?.versions || TRANSLATIONS.en.versions;

    const formattedType =
      tTypes[jerseyOfTheDay.type?.toUpperCase()] ||
      jerseyOfTheDay.type?.toLowerCase() ||
      '';
    const formattedVersion =
      tVersions[jerseyOfTheDay.version?.toUpperCase()] ||
      jerseyOfTheDay.version?.toLowerCase() ||
      '';

    const story = generateJerseyStory(
      {
        clubName: jerseyOfTheDay.club.name,
        season: jerseyOfTheDay.season as string,
        type: formattedType,
        version: formattedVersion,
        playerName: jerseyOfTheDay.playerName,
      },
      locale,
    );

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

      const jersey = await this.prisma.jersey.findUnique({
        where: { id: jerseyId },
        include: {
          club: true,
          user: {
            select: {
              id: true,
              expoPushToken: true,
              username: true,
              language: true, //  langue du propriétaire du maillot
            },
          },
        },
      });

      if (jersey && jersey.userId !== userId && jersey.user.expoPushToken) {
        const liker = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { username: true },
        });

        const likerName = liker?.username || 'Someone';

        // Utilise la langue du DESTINATAIRE (propriétaire du maillot liké)
        const recipientLocale = (jersey.user.language as 'en' | 'fr') || 'en';
        const notifTranslations =
          TRANSLATIONS[recipientLocale]?.notifications ||
          TRANSLATIONS.en.notifications;

        await this.notificationsService.sendPushNotification(
          jersey.user.expoPushToken,
          notifTranslations.likeTitle,
          notifTranslations.likeBody(likerName, jersey.club.name),
          { type: 'like', jerseyId: jersey.id, username: jersey.user.username },
        );
      }

      // This like may have just pushed the jersey into the weekly top 3 —
      // let its owner know, independently of who liked it.
      if (jersey) {
        try {
          await this.notifyIfEnteredWeeklyTop3(jersey);
        } catch (error) {
          console.error(
            `Failed to send weekly top ${TOP_WEEKLY_RANK_THRESHOLD} notification for jersey ${jerseyId}:`,
            error,
          );
        }
      }

      return { liked: true };
    }
  }

  /**
   * Notifies a jersey's owner when it enters the weekly top 3, with a
   * cooldown so a jersey hovering around the #3 boundary doesn't trigger a
   * push on every single like.
   */
  private async notifyIfEnteredWeeklyTop3(jersey: {
    id: string;
    lastTopWeeklyNotifiedAt: Date | null;
    club: { name: string };
    user: {
      expoPushToken: string | null;
      language: string;
    };
  }) {
    if (!jersey.user.expoPushToken) return;

    if (
      jersey.lastTopWeeklyNotifiedAt &&
      Date.now() - jersey.lastTopWeeklyNotifiedAt.getTime() <
        TOP_WEEKLY_NOTIFICATION_COOLDOWN_MS
    ) {
      return;
    }

    const rank = await this.rankingsService.getJerseyWeeklyRank(
      jersey.id,
      TOP_WEEKLY_RANK_THRESHOLD,
    );
    if (rank === null) return;

    await this.prisma.jersey.update({
      where: { id: jersey.id },
      data: { lastTopWeeklyNotifiedAt: new Date() },
    });

    const recipientLocale = (jersey.user.language as 'en' | 'fr' | 'es') || 'en';
    const notifTranslations =
      TRANSLATIONS[recipientLocale]?.notifications || TRANSLATIONS.en.notifications;

    await this.notificationsService.sendPushNotification(
      jersey.user.expoPushToken,
      notifTranslations.topWeeklyTitle,
      notifTranslations.topWeeklyBody(rank, jersey.club.name),
      { type: 'top_weekly', jerseyId: jersey.id, rank: String(rank) },
    );
  }
}
