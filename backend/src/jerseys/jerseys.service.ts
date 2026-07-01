import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateJerseyDto } from './dto/createJersey.dto';

@Injectable()
export class JerseysService {
  constructor(private prisma: PrismaService) {}

  // jerseys.service.ts
  async createJersey(
    userId: string,
    dto: CreateJerseyDto,
    clubData: { name: string; sportId: string },
  ) {
    if (!dto.frontImageUrl) {
      throw new BadRequestException('frontImageUrl is required');
    }

    // 1. Upsert du club (correct avec votre @@unique)
    const club = await this.prisma.club.upsert({
      where: {
        sportId_name: { sportId: clubData.sportId, name: clubData.name },
      },
      update: {},
      create: { name: clubData.name, sportId: clubData.sportId },
    });

    // 2. Préparation des données pour Prisma
    // On ne garde que les champs définis dans le modèle Jersey
    const jerseyData = {
      userId,
      sportId: clubData.sportId,
      clubId: club.id,
      frontImageUrl: dto.frontImageUrl, // Correspond au frontImageUrl du schéma
      backImageUrl: dto.backImageUrl || null,
      playerName: dto.playerName || null,
      number: dto.number ? Number(dto.number) : null,
      season: dto.season || null,
      type: dto.type || null,
      size: dto.size || null,
      condition: dto.condition || null,
      version: dto.version || null,
      description: dto.description || null,
    };

    // 3. Création
    return await this.prisma.jersey.create({
      data: jerseyData,
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
