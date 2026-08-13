import { Module } from '@nestjs/common';
import { LockerController } from './locker.controller';
import { LockerService } from './locker.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { R2Service } from 'src/r2/r2.service';

@Module({
  imports: [PrismaModule],
  controllers: [LockerController],
  providers: [LockerService, R2Service],
})
export class LockerModule {}
