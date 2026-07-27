import { Module } from '@nestjs/common';
import { KotdService } from './kotd.service';
import { KotdController } from './kotd.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { R2Service } from 'src/r2/r2.service';

@Module({
  providers: [KotdService, PrismaService, R2Service],
  controllers: [KotdController],
})
export class KotdModule {}
