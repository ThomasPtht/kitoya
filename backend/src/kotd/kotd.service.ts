import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import {
  dateInTimeZone,
  generateJerseyStory,
  hourInTimeZone,
  pickJerseyOfTheDay,
} from './kotd-helper';
import { R2Service } from '../r2/r2.service';
import { NotificationsService } from '../notifications/notifications.service';
import { getHiddenUserIds } from '../moderation/blocks.helper';
import { RankingsService } from '../rankings/rankings.service';

// A jersey newly entering the weekly top 3 won't be re-notified more than
// once within this window, even if it oscillates around the #3 boundary as
// likes come in and roll out of the 7-day window.
const TOP_WEEKLY_NOTIFICATION_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const TOP_WEEKLY_RANK_THRESHOLD = 3;

// The kit of the day is picked (and its owner notified) daily at this time.
const KOTD_TIME_ZONE = 'Europe/Paris';
const KOTD_HOUR = 9;

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
export class KotdService implements OnApplicationBootstrap {
  constructor(
    private prisma: PrismaService,
    private readonly r2Service: R2Service,
    private readonly notificationsService: NotificationsService,
    private readonly rankingsService: RankingsService,
  ) {}

  /**
   * Picks today's kit and notifies its owner, every day at KOTD_HOUR (Paris).
   * The kit of the day shown in the app switches at the same time.
   */
  @Cron(`0 ${KOTD_HOUR} * * *`, { timeZone: KOTD_TIME_ZONE })
  async selectDailyKit() {
    try {
      await this.ensureKitOfTheDay(dateInTimeZone(new Date(), KOTD_TIME_ZONE));
    } catch (error) {
      console.error('Kit of the day selection failed:', error);
    }
  }

  // Catch-up when the server was down at KOTD_HOUR (e.g. a deploy): today's
  // kit still gets picked as soon as it starts. No-op if already picked.
  async onApplicationBootstrap() {
    if (hourInTimeZone(new Date(), KOTD_TIME_ZONE) >= KOTD_HOUR) {
      await this.selectDailyKit();
    }
  }

  /**
   * Picks the kit for `date` and notifies its owner, unless it was already
   * picked. Safe to run concurrently: the pick is deterministic, so the
   * unique (jerseyId, date) lock lets only one run notify.
   */
  async ensureKitOfTheDay(date: string) {
    const existing = await this.prisma.dailyKitNotification.findFirst({
      where: { date },
    });
    if (existing) return;

    const jerseys = await this.prisma.jersey.findMany({
      select: { id: true, user: { select: { id: true } } },
    });
    if (jerseys.length === 0) return;

    const picked = pickJerseyOfTheDay(jerseys, date);

    try {
      await this.prisma.dailyKitNotification.create({
        data: { jerseyId: picked.id, date },
      });
    } catch (error) {
      // P2002: another run already picked (and notified) this kit today
      if ((error as { code?: string }).code === 'P2002') return;
      throw error;
    }

    const jersey = await this.prisma.jersey.findUnique({
      where: { id: picked.id },
      include: {
        club: true,
        user: { select: { expoPushToken: true, language: true } },
      },
    });
    if (!jersey?.user.expoPushToken) return;

    // Utilise la langue du DESTINATAIRE (propriétaire du maillot)
    const recipientLocale = (jersey.user.language as 'en' | 'fr' | 'es') || 'en';
    const notifTranslations =
      TRANSLATIONS[recipientLocale]?.notifications ||
      TRANSLATIONS.en.notifications;

    try {
      await this.notificationsService.sendPushNotification(
        jersey.user.expoPushToken,
        notifTranslations.kotdTitle,
        notifTranslations.kotdBody(jersey.club.name),
        { type: 'kotd', jerseyId: jersey.id },
      );
    } catch (error) {
      console.error(
        `Failed to send kit of the day notification for jersey ${jersey.id}:`,
        error,
      );
    }
  }

  async getJerseyOfTheDay(
    currentUserId?: string,
    locale: 'en' | 'fr' | 'es' = 'en',
  ) {
    const jerseyOfTheDay = await this.findCurrentKit(currentUserId);
    if (!jerseyOfTheDay) {
      return null;
    }

    // The kit of the day is the same for everyone: a viewer who blocked its owner
    // (or was blocked by them) just doesn't see it.
    const hiddenUserIds = await getHiddenUserIds(this.prisma, currentUserId);
    if (hiddenUserIds.includes(jerseyOfTheDay.user.id)) {
      return null;
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

  // Most recent pick whose jersey still exists (its owner may have deleted it).
  private async findCurrentKit(currentUserId?: string) {
    const recentPicks = await this.prisma.dailyKitNotification.findMany({
      orderBy: { date: 'desc' },
      take: 7,
      select: { jerseyId: true },
    });

    for (const { jerseyId } of recentPicks) {
      const jersey = await this.findKitForViewer(jerseyId, currentUserId);
      if (jersey) return jersey;
    }
    return null;
  }

  // Only public fields of the owner: this is sent to every viewer.
  private findKitForViewer(jerseyId: string, currentUserId?: string) {
    return this.prisma.jersey.findUnique({
      where: { id: jerseyId },
      include: {
        club: true,
        user: { select: { id: true, username: true, isPublic: true } },
        _count: { select: { likes: true } },
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
