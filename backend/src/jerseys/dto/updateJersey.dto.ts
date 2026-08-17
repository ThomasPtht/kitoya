// backend/src/jerseys/dto/updateJersey.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateJerseyDto } from './createJersey.dto';

export class UpdateJerseyDto extends PartialType(CreateJerseyDto) {}
