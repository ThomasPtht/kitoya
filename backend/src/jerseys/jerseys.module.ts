import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { JerseysController } from './jerseys.controller';
import { JerseysService } from './jerseys.service';

@Module({
  imports: [PrismaModule],
  controllers: [JerseysController],
  providers: [JerseysService],
})
export class JerseysModule {}
