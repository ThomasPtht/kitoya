import {
  BadRequestException,
  Body,
  Controller,
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
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';

@Controller('jerseys')
export class JerseysController {
  constructor(
    private readonly jerseysService: JerseysService,
    private readonly R2Service: R2Service,
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
    if (!files.frontImage || files.frontImage.length === 0) {
      throw new BadRequestException('Front image is required');
    }

    // upload front and back images to R2 if they exist
    const frontUrl = files.frontImage
      ? await this.R2Service.uploadFile(files.frontImage[0])
      : null;
    const backUrl = files.backImage
      ? await this.R2Service.uploadFile(files.backImage[0])
      : null;

    // creation in database with the URLs of the uploaded images
    return this.jerseysService.createJersey(req.user.id, {
      ...createJerseyDto,
      frontImageUrl: frontUrl || '',
      backImageUrl: backUrl || undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jerseysService.getJerseyById(id);
  }

  @Get()
  findAll() {
    return this.jerseysService.getJerseys();
  }
}
