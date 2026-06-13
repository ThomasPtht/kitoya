// prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect(); // connection to the database when the module is initialized
  }

  async onModuleDestroy() {
    await this.$disconnect(); // close the connection to the database when the module is destroyed
  }
}
