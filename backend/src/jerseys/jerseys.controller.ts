import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JerseysService } from './jerseys.service';
import { R2Service } from '../r2/r2.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateJerseyDto } from './dto/createJersey.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('jerseys')
export class JerseysController {
  constructor(
    private readonly jerseysService: JerseysService,
    private readonly R2Service: R2Service,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createJersey(@Request() req, @Body() createJerseyDto: CreateJerseyDto) {
    return this.jerseysService.createJersey(req.user.id, createJerseyDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jerseysService.getJerseyById(id);
  }

  @Get()
  findAll() {
    return this.jerseysService.getJerseys();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadJerseyImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.R2Service.uploadFile(file);
    return { url };
  }
}
