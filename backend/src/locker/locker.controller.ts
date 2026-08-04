import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LockerService } from './locker.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('locker')
export class LockerController {
  constructor(private lockerService: LockerService) {}

  @UseGuards(JwtAuthGuard) // Optional: Use this if you want to get the current user from the request
  @Get(':username')
  async getPublicLocker(
    @Param('username') username: string,
    @Req() req: any, // to get the current user id from the request, if needed
  ) {
  
    const currentUserId = req.user?.userId; // Assuming you have a user object in the request

    try {
      const lockerData = await this.lockerService.getPublicLockerByUsername(
        username,
        currentUserId,
      );
      return lockerData;
    } catch (error: unknown) {
      console.error(
        '❌ [LockerController] Erreur lors de la récupération du locker :',
        error,
      );
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred';
      throw new NotFoundException(message);
    }
  }
}
