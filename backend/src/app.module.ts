import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JerseysController } from './jerseys/jerseys.controller';
import { JerseysService } from './jerseys/jerseys.service';
import { JerseysModule } from './jerseys/jerseys.module';

@Module({
  imports: [PrismaModule, AuthModule, JerseysModule],
  controllers: [AppController, JerseysController],
  providers: [AppService, JerseysService],
})
export class AppModule {}
