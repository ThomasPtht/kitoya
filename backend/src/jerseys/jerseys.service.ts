import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateJerseyDto } from './dto/createJersey.dto';
import { R2Service } from '../r2/r2.service';
import { FootballService } from '../search/football.service';

@Injectable()
export class JerseysService {
  constructor(
    private prisma: PrismaService,
    private readonly r2Service: R2Service,
    private readonly FootballService: FootballService,
  ) {}

  private async signJersey<
    T extends { frontImageUrl: string; backImageUrl: string | null },
  >(jersey: T) {
    const [frontImageUrl, backImageUrl] = await Promise.all([
      this.r2Service.getSignedUrl(jersey.frontImageUrl),
      this.r2Service.getSignedUrl(jersey.backImageUrl),
    ]);

    return {
      ...jersey,
      frontImageUrl: frontImageUrl ?? jersey.frontImageUrl,
      backImageUrl,
    };
  }

  async createJersey(
    userId: string,
    dto: CreateJerseyDto,
    clubData: { name: string; sportId: string },
  ) {
    //search or create the club in the database
    let club = await this.prisma.club.findFirst({
      where: {
        sportId: clubData.sportId,
        name: clubData.name,
      },
    });

    if (!club || !club.logoUrl) {
      // If the club doesn't exist or doesn't have a logo, search for it using the FootballService
      console.log(`Club ${clubData.name} inconnu. Appel API en cours...`);
      const teams = await this.FootballService.searchTeams(clubData.name);
      const foundLogo = teams[0]?.logo;

      if (!club) {
        // create the club if it doesn't exist
        club = await this.prisma.club.create({
          data: {
            name: clubData.name,
            sportId: clubData.sportId,
            logoUrl: foundLogo,
          },
        });
      } else if (foundLogo) {
        // Update the club with the found logo if it exists but without a logo
        console.log(
          `Logo trouvé pour le club ${clubData.name}. Mise à jour en cours...`,
        );
        club = await this.prisma.club.update({
          where: { id: club.id },
          data: { logoUrl: foundLogo },
        });
      }
    }

    // Prepare and create the jersey data

    const jerseyData = {
      userId,
      sportId: clubData.sportId,
      clubId: club.id,
      frontImageUrl: dto.frontImageUrl,
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

    // Create the jersey in the database and include the club and sport relations
    const createdJersey = await this.prisma.jersey.create({
      data: jerseyData,
      include: { club: true, sport: true },
    });

    return this.signJersey(createdJersey);
  }

  async searchClubs(query: string, sportId: string) {
    // Search for clubs in the database first
    const dbClubs = await this.prisma.club.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive', // Case-insensitive search
        },
        sportId: sportId,
      },
      take: 5, // Limit the number of results
    });

    // If we found clubs in the database, return them
    if (dbClubs.length > 0) {
      return dbClubs;
    }

    // If no clubs were found in the database, search using the FootballService
    const apiClubs = await this.FootballService.searchTeams(query);

    // Save the found clubs to the database for future searches
    if (apiClubs && apiClubs.length > 0) {
      for (const team of apiClubs) {
        await this.prisma.club.upsert({
          where: {
            sportId_name: {
              sportId: sportId,
              name: team.name,
            },
          },
          update: {
            logoUrl: team.logo,
          },
          create: {
            name: team.name,
            sportId: sportId,
            logoUrl: team.logo,
          },
        });
      }
    }
    return apiClubs;
  }

  async getJerseys() {
    const jerseys = await this.prisma.jersey.findMany({
      include: { club: true },
    });

    return Promise.all(jerseys.map((jersey) => this.signJersey(jersey)));
  }

  async getJerseyById(id: string) {
    const jersey = await this.prisma.jersey.findUnique({
      where: { id },
      include: { club: true },
    });

    if (!jersey) {
      throw new NotFoundException(`Jersey with ID ${id} not found`);
    }

    return this.signJersey(jersey);
  }

  async deleteJersey(id: string) {
    const jersey = await this.prisma.jersey.findUnique({
      where: { id },
    });

    if (!jersey) {
      throw new NotFoundException(`Jersey with ID ${id} not found`);
    }

    // delete the images from R2
    await Promise.all([
      this.r2Service.deleteFile(jersey.frontImageUrl),
      jersey.backImageUrl
        ? this.r2Service.deleteFile(jersey.backImageUrl)
        : null,
    ]);

    // delete the jersey from the database
    await this.prisma.jersey.delete({
      where: { id },
    });
  }

  async getTotalJerseysCount(userId?: string): Promise<number> {
    const count = await this.prisma.jersey.count({
      where: {
        userId: userId,
      },
    });
    return count;
  }

  async getMostReprentedClub(userId: string) {
    // 1. On cherche d'abord les maillots de l'utilisateur pour grouper par club
    const result = await this.prisma.jersey.groupBy({
      by: ['clubId'],
      where: { userId: userId }, // On filtre bien par l'utilisateur ici
      _count: { clubId: true },
      orderBy: { _count: { clubId: 'desc' } },
      take: 1,
    });

    if (result.length === 0) return null;

    // 2. Maintenant on récupère le nom du club avec son ID
    const club = await this.prisma.club.findUnique({
      where: { id: result[0].clubId },
      select: { id: true, name: true, logoUrl: true },
    });

    return {
      id: club?.id,
      name: club?.name || 'Unknown Club',
      count: result[0]._count.clubId,
      logoUrl: club?.logoUrl || null,
    };
  }
}
