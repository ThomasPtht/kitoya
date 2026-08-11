import { IsString, IsEmail, IsOptional, IsIn, MinLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsIn(['Question', 'Bug', 'Feature'])
  type!: 'Question' | 'Bug' | 'Feature';

  @IsString()
  @MinLength(1)
  message!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}