import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existsingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existsingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        username: dto.username,
      },
    });

    // Generate JWT token
    const paylod = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(paylod),
      user: { id: user.id, email: user.email, username: user.username },
    };
  }
}
