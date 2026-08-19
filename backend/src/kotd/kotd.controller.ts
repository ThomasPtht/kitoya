import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { KotdService } from './kotd.service';

@Controller('kotd')
export class KotdController {
  constructor(private readonly kotdService: KotdService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getKOTD(
    @Req() req: Request,
    @Query('locale') locale: 'en' | 'fr' = 'en',
  ) {
    console.log('Locale reçue par le backend:', locale);
    const currentUserId = (req as any).user?.userId || (req as any).user?.id;
    return this.kotdService.getJerseyOfTheDay(currentUserId, locale);
  }

  @Post(':jerseyId/like')
  @UseGuards(AuthGuard('jwt'))
  async toggleLike(@Param('jerseyId') jerseyId: string, @Req() req: Request) {
    console.log('CONTENU REQ.USER 🔍:', (req as any).user);
    const userId = (req as any).user?.userId;
    return this.kotdService.toggleLike(jerseyId, userId);
  }
}
