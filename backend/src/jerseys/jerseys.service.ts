import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateJerseyDto } from './dto/createJersey.dto';

@Injectable()
export class JerseysService {
  constructor(private prisma: PrismaService) {}

  async createJersey(userId: string, dto: CreateJerseyDto) {
    const { sportId, clubId, ...jerseyData } = dto;

    const jersey = await this.prisma.jersey.create({
      data: {
        ...jerseyData,
        user: { connect: { id: userId } },
        sport: { connect: { id: sportId } },
        club: { connect: { id: clubId } },
      },
      include: { club: true, sport: true },
    });
  }

  
  async getJerseys() {
    const jerseys = await this.prisma.jersey.findMany({
      include: { club: true },
    });
    return jerseys;
  }

  async getJerseyById(id: string) {
    const jersey = await this.prisma.jersey.findUnique({
      where: { id },
      include: { club: true },
    });

    if (!jersey) {
      throw new NotFoundException(`Jersey with ID ${id} not found`);
    }
    return jersey;
  }
}
