import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { UserDbService } from '../db/user/user.service';
import { UnauthorizedException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userDbService: UserDbService;
  let authService: AuthService;
  let cacheManager: any;
  let configService: ConfigService;

  const mockUser = {
    id: 1,
    name: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    refresh_jti: 'refresh-token-id'
  };

  const mockAuthService = {
    comparePassword: jest.fn().mockResolvedValue(true),
    generateRefreshToken: jest.fn().mockResolvedValue('mock-refresh-token'),
    generateHashedPassword: jest.fn().mockResolvedValue('hashedpassword'),
  };

  const mockCacheManager = {
    del: jest.fn().mockResolvedValue(undefined),
  };

  const mockConfigService = {
    get: jest.fn()
  };

  const mockUserDbService = {
    findUser: jest.fn(),
    updateUser: jest.fn().mockResolvedValue(mockUser),
    createUser: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserDbService,
          useValue: mockUserDbService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userDbService = module.get<UserDbService>(UserDbService);
    authService = module.get<AuthService>(AuthService);
    cacheManager = module.get(CACHE_MANAGER);
    configService = module.get<ConfigService>(ConfigService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'password123',
      };

      // Mock the findUser method to return a user
      mockUserDbService.findUser.mockResolvedValueOnce({
        id: mockUser.id,
        password: mockUser.password,
      });

      mockAuthService.comparePassword.mockResolvedValueOnce(true);
      mockAuthService.generateRefreshToken.mockResolvedValue('mock-refresh-token');

      const result = await service.login(loginDto);
      
      expect(result).toBeDefined();
      expect(result.userId).toBe(mockUser.id);
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(mockUserDbService.findUser).toHaveBeenCalledWith(
        { name: loginDto.username },
        { id: true, password: true }
      );
      expect(mockAuthService.comparePassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password
      );
      expect(mockUserDbService.updateUser).toHaveBeenCalledWith(
        mockUser.id,
        { refresh_jti: expect.any(String) }
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const loginDto = {
        username: 'nonexistent',
        password: 'password123',
      };

      // Mock findUser to return null (user not found)
      mockUserDbService.findUser.mockResolvedValueOnce(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockUserDbService.findUser).toHaveBeenCalledWith(
        { name: loginDto.username },
        { id: true, password: true }
      );
      expect(mockAuthService.comparePassword).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      // Mock findUser to return a user
      mockUserDbService.findUser.mockResolvedValueOnce({
        id: mockUser.id,
        password: mockUser.password,
      });
      
      // Mock comparePassword to return false (invalid password)
      mockAuthService.comparePassword.mockResolvedValueOnce(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockUserDbService.findUser).toHaveBeenCalledWith(
        { name: loginDto.username },
        { id: true, password: true }
      );
      expect(mockAuthService.comparePassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password
      );
      expect(mockUserDbService.updateUser).not.toHaveBeenCalled();
    });
  });
});
