import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JerseysController } from './jerseys/jerseys.controller';
import { JerseysService } from './jerseys/jerseys.service';
import { JerseysModule } from './jerseys/jerseys.module';
import { R2Module } from './r2/r2.module';

@Module({
  imports: [PrismaModule, AuthModule, JerseysModule, R2Module],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
