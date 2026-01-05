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
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('valid()', () => {
    it('should return true if password matches hash', async () => {
      // jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.valid('123456', 'hashed');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashed');
    });

    it('should return false if password does not match', async () => {
      // jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
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
      const serviceSpy = jest.spyOn(usersService, 'find').mockResolvedValue(userMock)
      jest.spyOn(service, 'valid').mockResolvedValue(true);
      const jwtSpy = jest.spyOn(jwtService, 'signAsync').mockResolvedValue('jwt-token');

      const result = await service.sign(credentials);

      expect(result).toEqual({
        payload: {
          sub: 1,
          user: {
            id: 1,
            username: 'jeremi',
            role: 'admin',
            avatar: 'avatar.png',
          },
        },
        token: 'jwt-token',
      });

      expect(serviceSpy).toHaveBeenCalledWith({ username: 'jeremi' });
      expect(jwtSpy).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      usersService.find.mockResolvedValue(null);

      await expect(service.sign(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      usersService.find.mockResolvedValue(userMock);
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
