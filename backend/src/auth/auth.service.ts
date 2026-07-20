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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // findFirst is used instead of findUnique because we want to check both email and username for existing users
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('User already exists'); // code 409
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

      // Generate JWT token
      const payload = { sub: user.id, email: user.email };
      return {
        access_token: await this.jwtService.signAsync(payload),
        user: { id: user.id, email: user.email, username: user.username },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // to handle unique constraint violation error, which is thrown when trying to create a user with an existing email or username
        if (error.code === 'P2002') {
          throw new ConflictException('User already exists');
        }
      }
      throw error; // rethrow other errors
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // The case of !password doesnt allow to login with OAuth email, because the password is null in database. A OAuth user has to login with his provider google..and not with email/password.
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    } // code 401

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials'); // code 401
    }

    const paylod = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(paylod),
      user: { id: user.id, email: user.email, username: user.username },
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
}
