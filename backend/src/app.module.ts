import { Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

import { JerseysModule } from './jerseys/jerseys.module';
import { R2Module } from './r2/r2.module';
import { SportsModule } from './sports/sports.module';
import { ImageProcessingModule } from './image-processing/image-processing.module';
import { KotdModule } from './kotd/kotd.module';
import { EmailService } from './email/email.service';
import { PasswordResetService } from './password-reset/password-reset.service';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { GoogleStrategyService } from './google-strategy/google-strategy.service';
import { GoogleStrategyController } from './google-strategy/google-strategy.controller';
import { GoogleStrategyModule } from './google-strategy/google-strategy.module';
import { LockerService } from './locker/locker.service';
import { LockerController } from './locker/locker.controller';
import { LockerModule } from './locker/locker.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FeedbackService } from './feedback/feedback.service';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    PrismaModule,
    AuthModule,
    JerseysModule,
    R2Module,
    SportsModule,
    ImageProcessingModule,
    KotdModule,
    PasswordResetModule,
    SubscriptionModule,
    GoogleStrategyModule,
    LockerModule,
    NotificationsModule,
    FeedbackModule,
  ],
  controllers: [AppController, GoogleStrategyController, LockerController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    AppService,
    EmailService,
    PasswordResetService,
    GoogleStrategyService,
    LockerService,
    FeedbackService,
  ],
})
export class AppModule {}
