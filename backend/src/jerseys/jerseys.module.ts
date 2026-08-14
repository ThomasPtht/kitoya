import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JerseysController } from './jerseys.controller';
import { JerseysService } from './jerseys.service';
import { R2Module } from '../r2/r2.module';
import { ImageProcessingModule } from '../image-processing/image-processing.module';
import { FootballModule } from '../search/football.module';

@Module({
  imports: [PrismaModule, R2Module, FootballModule, ImageProcessingModule],
  controllers: [JerseysController],
  providers: [JerseysService],
})
export class JerseysModule {}
