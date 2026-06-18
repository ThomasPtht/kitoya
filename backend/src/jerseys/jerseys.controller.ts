import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JerseysService } from './jerseys.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateJerseyDto } from './dto/createJersey.dto';

@Controller('jerseys')
export class JerseysController {
  constructor(private readonly jerseysService: JerseysService) {}

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
}
