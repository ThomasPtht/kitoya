import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { Prisma } from '@prisma/client';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: dto.email, mode: 'insensitive' } },
          { username: { equals: dto.username, mode: 'insensitive' } },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          username: dto.username,
        },
      });

      const payload = {
        sub: user.id,
        email: user.email,
        username: user.username,
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isPublic: user.isPublic,
          planType: 'FREE',
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('User already exists');
        }
      }
      throw error;
    }
  }

  async checkUsername(username: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        username: { equals: username, mode: 'insensitive' },
      },
    });
    return { available: !existingUser };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    console.log('🔍 [AuthService] Payload généré pour le token :', payload); // <-- ICI
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isPublic: user.isPublic,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletedUser = await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      message: 'User account deleted successfully',
      user: deletedUser.id,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async generateUniqueUsername(baseEmail: string) {
    let baseUsername = baseEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    let username = baseUsername;
    let counter = 1;

    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }
    return username;
  }

  async validateGoogleUser(googleUser: { email: string }) {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      const username = await this.generateUniqueUsername(googleUser.email);

      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          username,
          password: null,
        },
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isPublic: user.isPublic,
        planType: 'FREE',
      },
    };
  }

  async changeUsername(userId: string, newUsername: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: newUsername },
    });

    if (existingUser) {
      throw new ConflictException('Username already taken');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { username: newUsername },
    });

    return {
      message: 'Username changed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        isPublic: updatedUser.isPublic,
      },
    };
  }

  async updateProfile(userId: string, dto: { isPublic?: boolean }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async updateBio(bio: string, userId: string) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { bio },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
