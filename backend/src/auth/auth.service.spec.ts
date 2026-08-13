import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Mock the PrismaService and JwtService dependencies
  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('fake-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // to avoid interference between tests
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'thomas@example.com',
      username: 'thomas',
      password: 'securePassword123',
    };

    it('shoud throw ConflictException if a user with the same mail or username already exists', async () => {
      // Mock the PrismaService to simulate an existing user
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'existing-user-id',
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );

      // Check that the create method was not called if conflict is detected
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should create a new user and return a JWT token on successful registration', async () => {
      // Mock the PrismaService to simulate no existing user
      mockPrismaService.user.findFirst.mockResolvedValue(null); // null means no user found, so we can proceed to create a new user
      mockPrismaService.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: registerDto.email,
        username: registerDto.username,
        isPublic: true,
        planType: 'FREE',
      });

      const result = await service.register(registerDto);

      expect(result.access_token).toBe('fake-jwt-token');
      expect(result.user).toEqual({
        id: 'new-user-id',
        email: registerDto.email,
        username: registerDto.username,
        isPublic: true,
        planType: 'FREE',
      });

      // check that the password is hashed before being stored in the database
      const createCallArgs = mockPrismaService.user.create.mock.calls[0][0]; // call[0] is the first call, [0] is the first argument of that call
      expect(createCallArgs.data.password).not.toBe(registerDto.password); // the password should be hashed, so it should not match the original password
      const isHashed = await bcrypt.compare(
        registerDto.password,
        createCallArgs.data.password,
      );
      expect(isHashed).toBe(true);
    });

    // contraint violation is when two requests are made at the same time and both pass the findFirst check, but only one can succeed in creating the user due to the unique constraint on email/username. The other will fail with a Prisma error.
    it('should throw ConflictException on Prisma unique constraint violation (race condition)', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const prismaError = Object.create(
        Prisma.PrismaClientKnownRequestError.prototype,
      );
      prismaError.message = 'Unique constraint violation';
      prismaError.code = 'P2002';
      prismaError.clientVersion = '5.0.0';

      // simulate a PrismaClientKnownRequestError for unique constraint violation
      mockPrismaService.user.create.mockRejectedValue(prismaError);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'thomas@example.com',
      password: 'securePassword123',
    };

    it('should throw UnauthorizedException if the user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException if the password doesnt match', async () => {
      const userFromDb = {
        id: 'user-id',
        email: loginDto.email,
        password: await bcrypt.hash('differentPassword', 10), // hashed password that doesn't match the loginDto password
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userFromDb);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should return a JWT token and user info on successful login', async () => {
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const userFromDb = {
        id: 'user-id',
        email: loginDto.email,
        username: 'thomas',
        password: hashedPassword,
        isPublic: true,
        subscription: { planType: 'ELITE_MONTHLY' },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userFromDb);

      const result = await service.login(loginDto);

      expect(result.access_token).toBe('fake-jwt-token');
      expect(result.user).toEqual({
        id: userFromDb.id,
        email: userFromDb.email,
        username: userFromDb.username,
        isPublic: userFromDb.isPublic,
        planType: 'ELITE_MONTHLY',
      });
    });

    it('should return planType as FREE if subscription is null', async () => {
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const userFromDb = {
        id: 'user-id',
        email: loginDto.email,
        username: 'thomas',
        password: hashedPassword,
        isPublic: true,
        subscription: null, // no subscription
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userFromDb);

      const result = await service.login(loginDto);

      expect(result.user.planType).toBe('FREE');
    });
  });
});
