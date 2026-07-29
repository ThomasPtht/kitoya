import { JerseyType, KitCondition, KitVersion } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
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
  IsNumber,
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

  // @IsNotEmpty()
  // @IsString()
  // frontImageUrl!: string;

  // @IsOptional()
  // @IsString()
  // backImageUrl?: string;

  @IsOptional()
  @IsString()
  playerName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99)
  number?: number;

  @IsOptional()
  @IsString()
  season?: string;

  @IsEnum(JerseyType)
  type!: JerseyType;

  @IsOptional()
  @IsString()
  size?: string;

  @IsEnum(KitCondition)
  condition!: KitCondition;

  @IsEnum(KitVersion)
  version!: KitVersion;

  @IsOptional()
  @IsString()
  description?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isOfficial!: boolean;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isShareable!: boolean;

  @IsNotEmpty()
  @IsString()
  brand!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  purchasePrice?: number;
}
