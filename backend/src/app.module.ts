import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JerseysController } from './jerseys/jerseys.controller';
import { JerseysService } from './jerseys/jerseys.service';
import { JerseysModule } from './jerseys/jerseys.module';
import { R2Module } from './r2/r2.module';
import { SportsModule } from './sports/sports.module';
import { ImageProcessingModule } from './image-processing/image-processing.module';
import { KotdModule } from './kotd/kotd.module';
import { EmailService } from './email/email.service';
import { PasswordResetService } from './password-reset/password-reset.service';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { StripeModule } from './stripe/stripe.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { GooglestrategyService } from './googlestrategy/googlestrategy.service';
import { GooglestrategyController } from './googlestrategy/googlestrategy.controller';
import { GooglestrategyModule } from './googlestrategy/googlestrategy.module';
import { GoogleStrategyService } from './google-strategy/google-strategy.service';
import { GoogleStrategyController } from './google-strategy/google-strategy.controller';
import { GoogleStrategyModule } from './google-strategy/google-strategy.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JerseysModule,
    R2Module,
    SportsModule,
    ImageProcessingModule,
    KotdModule,
    PasswordResetModule,
    StripeModule,
    SubscriptionModule,
    GooglestrategyModule,
    GoogleStrategyModule,
  ],
  controllers: [AppController, GooglestrategyController, GoogleStrategyController],
  providers: [AppService, EmailService, PasswordResetService, GooglestrategyService, GoogleStrategyService],
})
export class AppModule {}
