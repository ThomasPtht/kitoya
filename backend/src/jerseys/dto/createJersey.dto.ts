import { JerseyType, KitCondition, KitVersion } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsUUID,
  Min,
  Max,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class CreateJerseyDto {
  @IsNotEmpty()
  @IsUUID()
  sportId!: string;

  @IsOptional()
  @IsUUID()
  clubId?: string;

  @IsNotEmpty()
  @IsString()
  clubName!: string;

  @IsNotEmpty()
  @IsString()
  frontImageUrl!: string;

  @IsOptional()
  @IsString()
  backImageUrl?: string;

  @IsOptional()
  @IsString()
  playerName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  number?: number;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @IsEnum(JerseyType)
  type!: JerseyType;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsEnum(KitCondition)
  condition!: KitCondition;

  @IsOptional()
  @IsEnum(KitVersion)
  version!: KitVersion;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  isOfficial!: boolean | string;

  @IsBoolean()
  isShareable!: boolean | string;

  @IsNotEmpty()
  @IsString()
  brand!: string;
}
