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
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Request } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { ChangeUsernameDto } from './dto/change-username';

interface JwtRequest extends Request {
  user: {
    userId: string;
    email: string;
    username: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('check-username/:username')
  async checkUsername(@Param('username') username: string) {
    return this.authService.checkUsername(username);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: JwtRequest) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-account')
  deleteAccount(@Req() req: JwtRequest) {
    return this.authService.deleteAccount(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@Req() req: JwtRequest, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, dto);
  }

  @Post('change-username')
  @UseGuards(JwtAuthGuard)
  async changeUsername(@Req() req: JwtRequest, @Body() dto: ChangeUsernameDto) {
    return this.authService.changeUsername(req.user.userId, dto.newUsername);
  }

  @Post('update-profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: JwtRequest, @Body() dto: any) {
    return this.authService.updateProfile(req.user.userId, dto);
  }

  @Post('update-bio')
  @UseGuards(JwtAuthGuard)
  async updateBio(@Req() req: JwtRequest, @Body('bio') bio: string) {
    const userId = req.user.userId;
    return this.authService.updateBio(bio, userId);
  }
}
