import { Module } from '@nestjs/common';

import { StripeService } from './stripe.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [],
  providers: [StripeService, PrismaService],
})
export class StripeModule {}
