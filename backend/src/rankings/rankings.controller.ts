import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RankingsService } from './rankings.service';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get('weekly')
  @UseGuards(AuthGuard('jwt'))
  async getWeeklyRankings(
    @Req() req: Request,
    @Query('limit') limit?: string,
  ) {
    const currentUserId = (req as any).user?.userId || (req as any).user?.id;

    const parsedLimit = limit ? parseInt(limit, 10) : DEFAULT_LIMIT;
    const safeLimit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_LIMIT)
        : DEFAULT_LIMIT;

    return this.rankingsService.getWeeklyRankings(safeLimit, currentUserId);
  }
}
