import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { UserDbService } from 'src/db/user/user.service';

describe('UserService', () => {
  let service: UserService;
  let userDbService: UserDbService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'UserDbService',
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
            create: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userDbService = module.get<UserDbService>('UserDbService');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should be able to register', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const result = await service.login(loginDto);
      
      expect(result).toBeDefined();
    });
  });
});
