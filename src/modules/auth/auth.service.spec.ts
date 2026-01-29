import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../../database/entities/users.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser: UserEntity = {
    id: '1',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            validateUser: jest.fn(),
            updateLastLogin: jest.fn(),
            findById: jest.fn()
          }
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return user and token when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const token = 'jwt-token';

      jest.spyOn(usersService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(usersService, 'updateLastLogin').mockResolvedValue(undefined);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);

      const result = await service.login(email, password);

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role
        },
        token,
        expiresAt: expect.any(String)
      });
      expect(usersService.validateUser).toHaveBeenCalledWith(email, password);
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      jest.spyOn(usersService, 'validateUser').mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user when user exists and is active', async () => {
      const payload = { sub: '1', email: 'test@example.com', role: 'admin' };

      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);

      const result = await service.validateUser(payload);

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith(payload.sub);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const payload = { sub: '1', email: 'test@example.com', role: 'admin' };

      jest.spyOn(usersService, 'findById').mockResolvedValue(null);

      await expect(service.validateUser(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const payload = { sub: '1', email: 'test@example.com', role: 'admin' };
      const inactiveUser = { ...mockUser, isActive: false };

      jest.spyOn(usersService, 'findById').mockResolvedValue(inactiveUser);

      await expect(service.validateUser(payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
