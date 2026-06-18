import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

export class CreateJerseyDto {
  @IsNotEmpty()
  @IsUUID()
  sportId!: string;

  @IsNotEmpty()
  @IsUUID()
  clubId!: string;

  @IsNotEmpty()
  @IsString()
  imageUrl!: string; 

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
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
