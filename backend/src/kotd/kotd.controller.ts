import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { KotdService } from './kotd.service';

@Controller('kotd')
export class KotdController {
  constructor(private readonly kotdService: KotdService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getKOTD(@Req() req: Request) {
    const currentUserId = (req as any).user?.id;
    return this.kotdService.getJerseyOfTheDay(currentUserId);
  }

  @Post(':jerseyId/like')
  @UseGuards(AuthGuard('jwt'))
  async toggleLike(@Param('jerseyId') jerseyId: string, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.kotdService.toggleLike(jerseyId, userId);
  }
}
