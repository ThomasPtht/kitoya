import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SportsService {
  constructor(private prisma: PrismaService) {}

  // Get all sports
  async findAll() {
    return await this.prisma.sport.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // If needed, you can add more methods here, like findById, update, delete, etc.
  async create(createSportDto: any) {
    return await this.prisma.sport.create({
      data: createSportDto,
    });
  }
}
