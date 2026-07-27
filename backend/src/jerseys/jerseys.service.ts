import {
  BadRequestException,
  Get,
  Injectable,
  NotFoundException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateJerseyDto } from './dto/createJersey.dto';
import { R2Service } from '../r2/r2.service';
import { FootballService } from '../search/football.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Injectable()
export class JerseysService {
  constructor(
    private prisma: PrismaService,
    private readonly r2Service: R2Service,
    private readonly FootballService: FootballService,
  ) {}

  public async signJersey<
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
    //search for the club in the database first
    let club = await this.prisma.club.findUnique({
      where: {
        sportId_name: {
          sportId: clubData.sportId,
          name: clubData.name,
        },
      },
    });

    // if the club doesn't exist, search for it using the FootballService and create it in the database
    if (!club) {
      console.log(`Club ${clubData.name} inconnu. Recherche API...`);
      const teams = await this.FootballService.searchTeams(clubData.name);

      // search for the team with the exact name (case-insensitive), if not found, take the first one
      const targetTeam =
        teams.find(
          (t) => t.name.toLowerCase() === clubData.name.toLowerCase(),
        ) || teams[0];

      if (!targetTeam) {
        throw new BadRequestException(
          "Impossible de trouver le club via l'API.",
        );
      }

      club = await this.prisma.club.create({
        data: {
          name: targetTeam.name,
          sportId: clubData.sportId,
          logoUrl: targetTeam.logo,
        },
      });
    }
    // Update the club's logo if it's missing
    else if (!club.logoUrl) {
      const teams = await this.FootballService.searchTeams(clubData.name);
      const foundLogo = teams[0]?.logo;
      if (foundLogo) {
        club = await this.prisma.club.update({
          where: { id: club.id },
          data: { logoUrl: foundLogo },
        });
      }
    }

    // Prepare the jersey data for creation
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

    return apiClubs;
  }

  async getJerseysByUser(userId: string) {
    const jerseys = await this.prisma.jersey.findMany({
      where: { userId },
      include: { club: true, sport: true },
      orderBy: { createdAt: 'desc' },
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
