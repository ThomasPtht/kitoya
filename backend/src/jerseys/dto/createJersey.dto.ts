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

  @IsOptional()
  @IsString()
  playerName?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null ? undefined : Number(value),
  )
  @IsInt()
  @Min(0)
  @Max(99)
  number?: number;

  @IsOptional()
  @IsString()
  season?: string;

  @IsEnum(JerseyType)
  type!: JerseyType;

  @IsNotEmpty()
  @IsString()
  size!: string;

  @IsEnum(KitCondition)
  condition!: KitCondition;

  @IsEnum(KitVersion)
  version!: KitVersion;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return false; // Valeur par défaut de secours
  })
  @IsBoolean()
  isOfficial: boolean = false;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return false; 
  })
  @IsBoolean()
  isShareable: boolean = false;

  @IsNotEmpty()
  @IsString()
  brand!: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsNumber()
  purchasePrice?: number;
}
