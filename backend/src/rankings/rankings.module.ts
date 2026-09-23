import { Module } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { RankingsController } from './rankings.controller';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';

@Module({
  providers: [RankingsService, PrismaService, R2Service],
  controllers: [RankingsController],
  exports: [RankingsService],
})
export class RankingsModule {}
