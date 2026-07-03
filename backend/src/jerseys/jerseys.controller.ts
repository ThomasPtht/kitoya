import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JerseysService } from './jerseys.service';
import { R2Service } from '../r2/r2.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateJerseyDto } from './dto/createJersey.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ImageProcessingService } from '../image-processing/image-processing.service';

@Controller('jerseys')
export class JerseysController {
  constructor(
    private readonly jerseysService: JerseysService,
    private readonly R2Service: R2Service,
    private readonly imageProcessingService: ImageProcessingService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'frontImage', maxCount: 1 },
      { name: 'backImage', maxCount: 1 },
    ]),
  )
  async createJersey(
    @Request() req,
    @Body() createJerseyDto: CreateJerseyDto,
    @UploadedFiles()
    files: {
      frontImage?: Express.Multer.File[];
      backImage?: Express.Multer.File[];
    },
  ) {
    if (!files.frontImage?.[0])
      throw new BadRequestException('Front image is required');

    const userId = req.user?.userId;

    if (!userId) {
      throw new BadRequestException('Authenticated user id is missing');
    }

    console.log('--- DEBUG CONTROLLER ---');
    console.log('Body reçu :', createJerseyDto); // Si ce log est vide, le DTO a déjà rejeté la requête
    console.log('Files reçus :', files ? Object.keys(files) : 'Aucun');

    if (!createJerseyDto.sportId) {
      console.log('ATTENTION : sportId est vide dans le DTO');
    }

    const frontImageBuffer = files.frontImage[0].buffer;
    const processedFrontImage =
      await this.imageProcessingService.removeBackground(frontImageBuffer);

    try {
      // Upload
      const frontUrl = await this.R2Service.uploadFile({
        ...files.frontImage[0],
        buffer: processedFrontImage,
      });
      const backUrl = files.backImage
        ? await this.R2Service.uploadFile(files.backImage[0])
        : undefined;

      console.log('Front image uploaded to:', frontUrl);
      if (backUrl) {
        console.log('Back image uploaded to:', backUrl);
      }

      const sportId = req.body.sportId || createJerseyDto.sportId;
      const clubName = createJerseyDto.clubName;

      if (!sportId) {
        throw new BadRequestException('sportId est manquant dans le FormData');
      }

      const clubData = { name: clubName, sportId: sportId };

      const jerseyDtoWithUrls = {
        ...createJerseyDto,
        sportId: sportId,
        frontImageUrl: frontUrl,
        backImageUrl: backUrl,
      };

      return this.jerseysService.createJersey(
        userId,
        jerseyDtoWithUrls,
        clubData,
      );
    } catch (error) {
      console.error('Error while creating jersey:', error);
      throw error;
    }
  }

  @Get('total')
  @UseGuards(JwtAuthGuard)
  async totalJerseys(@Request() req) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('Authenticated user id is missing');
    }
    return await this.jerseysService.getTotalJerseysCount(userId);
  }

  @Get('MostRepresentedClub')
  @UseGuards(JwtAuthGuard)
  async mostRepresentedClub(@Request() req) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('Authenticated user id is missing');
    }
    return await this.jerseysService.getMostReprentedClub(userId);
  }

  @Get()
  findAll() {
    return this.jerseysService.getJerseys();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteJersey(@Param('id') id: string) {
    return this.jerseysService.deleteJersey(id);
  }
}
