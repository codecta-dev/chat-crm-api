import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@modules/users/users.service';
import { User } from '@modules/users/entities/user.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    find: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('valid()', () => {
    it('should return true if password matches hash', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.valid('123456', 'hashed');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashed');
    });

    it('should return false if password does not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.valid('123456', 'hashed');

      expect(result).toBe(false);
    });
  });

  describe('sign()', () => {
    const credentials = {
      username: 'jeremi',
      password: '123456',
    };

    const userMock = {
      id: 1,
      username: 'jeremi',
      password: 'hashed-password',
      role: 'admin',
      avatar: 'avatar.png',
    } as unknown as User;

    it('should return payload and token if credentials are valid', async () => {
      mockUsersService.find.mockResolvedValue(userMock);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.sign(credentials);

      expect(result).toEqual({
        payload: {
          sub: 1,
          company: 'no implemented yet',
        },
        token: 'jwt-token',
      });
      expect(mockUsersService.find).toHaveBeenCalledWith({ username: 'jeremi' });
      expect(mockJwtService.signAsync).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockUsersService.find.mockResolvedValue(null);

      await expect(service.sign(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUsersService.find.mockResolvedValue(userMock);
      jest.spyOn(service, 'valid').mockResolvedValue(false);

      await expect(service.sign(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh()', () => {
    it('should return not implemented message', () => {
      expect(service.refresh()).toEqual({
        message: 'Not implemented',
      });
    });
  });
});