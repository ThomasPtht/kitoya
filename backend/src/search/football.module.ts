// src/modules/football/football.module.ts
import { Module } from '@nestjs/common';
import { FootballService } from './football.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [FootballService],
  exports: [FootballService],
})
export class FootballModule {}
