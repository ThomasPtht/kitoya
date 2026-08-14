import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
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
      update: jest.fn(),
      delete: jest.fn(),
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

  describe('deleteAccount', () => {
    const userFromDb = {
      id: 'user-id',
      email: 'thomas@example.fr',
    };

    it('should throw NotFoundException if the user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteAccount(userFromDb.id)).rejects.toThrow(
        'User not found',
      );
    });

    it('should delete the user account if the user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(userFromDb);
      mockPrismaService.user.delete.mockResolvedValue(userFromDb);

      const result = await service.deleteAccount(userFromDb.id);

      expect(result).toEqual({
        message: 'User account deleted successfully',
        user: userFromDb.id,
      });

      // Verify that the PrismaService's delete method was called with the correct parameters
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userFromDb.id },
      });
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      oldPassword: 'currentPassword123',
      newPassword: 'newSecurePassword456',
    };

    it('should throw UnauthorizedException if oldpassword does not match', async () => {
      const userFromDb = {
        id: 'user-id',
        password: await bcrypt.hash(changePasswordDto.oldPassword, 10),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userFromDb);

      // Provide a wrong old password to simulate the mismatch
      const wrongOldPasswordDto = {
        ...changePasswordDto,
        oldPassword: 'wrongOldPassword',
      };

      await expect(
        service.changePassword(userFromDb.id, wrongOldPasswordDto),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should successfully change the password if old password matches', async () => {
      const userFromDb = {
        id: 'user-id',
        password: await bcrypt.hash(changePasswordDto.oldPassword, 10),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userFromDb);
      mockPrismaService.user.update.mockResolvedValue({}); // Mock the update method to simulate successful password change

      const result = await service.changePassword(
        userFromDb.id,
        changePasswordDto,
      );

      expect(result).toEqual({ message: 'Password changed successfully' });

      // Verify that the new password is hashed before being stored in the database
      const updateCallArgs = mockPrismaService.user.update.mock.calls[0][0];
      const isNewPasswordHashed = await bcrypt.compare(
        changePasswordDto.newPassword,
        updateCallArgs.data.password,
      );
      expect(isNewPasswordHashed).toBe(true);
    });

    it('should throw unauthorized exception if user doesnt have a password (log with google)', async () => {
      const userFromDb = {
        id: 'user-id',
        password: null, // user has no password set
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userFromDb);

      await expect(
        service.changePassword(userFromDb.id, changePasswordDto),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('changeUsername', () => {
    it('should throw ConflictException if the new username is already taken', async () => {
      const userId = 'user-id';
      const newUsername = 'existingUsername';

      // Mock the PrismaService to simulate an existing user with the new username
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'another-user-id',
        username: newUsername,
      });

      await expect(service.changeUsername(userId, newUsername)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should successfully change the username if it is unique', async () => {
      const userId = 'user-id';
      const newUsername = 'uniqueUsername';

      // Mock the PrismaService to simulate no existing user with the new username
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue({
        id: userId,
        email: 'thomas@example.com',
        username: newUsername,
        isPublic: true,
      });

      const result = await service.changeUsername(userId, newUsername);

      expect(result).toEqual({
        message: 'Username changed successfully',
        user: {
          id: userId,
          email: 'thomas@example.com',
          username: newUsername,
          isPublic: true,
        },
      });

      // Verify that the PrismaService's update method was called with the correct parameters
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { username: newUsername },
      });
    });
  });

  describe('updateProfile', () => {
    it('should update the user profile with provided fields', async () => {
      const userId = 'user-id';
      const updateDto = {
        isPublic: false,
        currency: 'USD',
        location: 'New York',
      };

      // Mock the PrismaService to simulate finding the user and updating the profile
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'thomas@example.com',
        username: 'thomas',
        isPublic: true,
        currency: 'EUR',
        location: 'Paris',
      });

      mockPrismaService.user.update.mockResolvedValue({
        id: userId,
        email: 'thomas@example.com',
        username: 'thomas',
        isPublic: updateDto.isPublic,
        currency: updateDto.currency,
        location: updateDto.location,
      });

      const result = await service.updateProfile(userId, updateDto);

      expect(result).toEqual({
        id: userId,
        email: 'thomas@example.com',
        username: 'thomas',
        isPublic: updateDto.isPublic,
        currency: updateDto.currency,
        location: updateDto.location,
      });

      // Verify that the PrismaService's update method was called with the correct parameters
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          isPublic: updateDto.isPublic,
          currency: updateDto.currency,
          location: updateDto.location,
        },
      });
    });

    it('should only update the fileds provided, leaving others unchanged', async () => {
      const userId = 'user-id';
      const updateDto = {
        currency: 'USD', // only updating currency
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'thomas@example.com',
        username: 'thomas',
        isPublic: true,
        currency: 'EUR',
        location: 'Paris',
      });

      mockPrismaService.user.update.mockResolvedValue({
        id: userId,
        email: 'thomas@example.com',
        username: 'thomas',
        isPublic: true, // unchanged
        currency: updateDto.currency, // updated
        location: 'Paris', // unchanged
      });

      await service.updateProfile(userId, updateDto);

      // check that only the currency field was updated and other fields remain unchanged
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          currency: updateDto.currency,
        }, // no isPublic or location in data, they should remain unchanged
      });
    });
  });

  describe('generateUniqueUsername', () => {
    it('should strip special characters from the email to build the base username', async () => {
      const baseEmail = 'thomas.dupont+test@example.fr';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const uniqueUsername = await service.generateUniqueUsername(baseEmail);

      expect(uniqueUsername).toBe('thomasduponttest');
    });

    it('should generate a unique username based on the base email', async () => {
      const baseEmail = 'thomas@example.fr';
      const baseUsername = 'thomas';

      // Simulate that the first two usernames are taken, and the third one is available
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce({ id: 'user1', username: baseUsername }) // thomas is taken
        .mockResolvedValueOnce({ id: 'user2', username: `${baseUsername}1` }) // thomas1 is taken
        .mockResolvedValueOnce(null); // thomas2 is available

      const uniqueUsername = await service.generateUniqueUsername(baseEmail);

      expect(uniqueUsername).toBe(`${baseUsername}2`); // the next available username should be thomas2
    });
  });
});
