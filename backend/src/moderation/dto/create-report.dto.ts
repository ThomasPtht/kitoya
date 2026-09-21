import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const REPORT_REASONS = [
  'SPAM',
  'INAPPROPRIATE',
  'HARASSMENT',
  'FAKE',
  'OTHER',
] as const;

export class CreateReportDto {
  @IsIn(['USER', 'JERSEY'])
  targetType!: 'USER' | 'JERSEY';

  @IsString()
  targetId!: string;

  @IsIn(REPORT_REASONS)
  reason!: (typeof REPORT_REASONS)[number];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  details?: string;
}
