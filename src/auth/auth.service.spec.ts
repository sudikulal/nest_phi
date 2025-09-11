import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', async () => {
      const payload = { userId: 1 };
      const mockToken = 'mock-access-token';
      
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'jwt.accessToken.secret') return 'test-secret';
        if (key === 'jwt.accessToken.expiresIn') return '1h';
        return null;
      });
      
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.generateAccessToken(payload);
      
      expect(result).toBe(mockToken);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, {
        secret: 'test-secret',
        expiresIn: '1h',
      });
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token', async () => {
      const payload = { userId: 1 };
      const mockToken = 'mock-refresh-token';
      
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'jwt.refreshToken.secret') return 'test-refresh-secret';
        if (key === 'jwt.refreshToken.expiresIn') return '7d';
        return null;
      });
      
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.generateRefreshToken(payload);
      
      expect(result).toBe(mockToken);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, {
        secret: 'test-refresh-secret',
        expiresIn: '7d',
      });
    });
  });
});
