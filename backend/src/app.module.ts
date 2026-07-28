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
  ],
  controllers: [AppController],
  providers: [AppService, EmailService, PasswordResetService],
})
export class AppModule {}
