import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateReportDto } from './dto/create-report.dto';
import { ModerationService } from './moderation.service';

interface JwtRequest extends Request {
  user: {
    userId: string;
    email: string;
    username: string;
  };
}

@Controller('moderation')
@UseGuards(JwtAuthGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('report')
  report(@Body() dto: CreateReportDto, @Req() req: JwtRequest) {
    return this.moderationService.createReport(req.user.userId, dto);
  }

  @Get('blocks')
  getBlocks(@Req() req: JwtRequest) {
    return this.moderationService.getBlockedUsers(req.user.userId);
  }

  @Post('block/:userId')
  block(@Param('userId') userId: string, @Req() req: JwtRequest) {
    return this.moderationService.blockUser(req.user.userId, userId);
  }

  @Delete('block/:userId')
  unblock(@Param('userId') userId: string, @Req() req: JwtRequest) {
    return this.moderationService.unblockUser(req.user.userId, userId);
  }
}
