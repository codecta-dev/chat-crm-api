import { Request, Response } from 'express';

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let res: jest.Mocked<Response>;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    res = {
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Response>;
  });

  describe('login', () => {
    it('should call AuthService.sign and set cookie', async () => {
      const dto: LoginDto = { username: 'jeremi', password: '1234' };
      const mockPayload = { sub: 'uuid', user: { username: 'jeremi' } };

      const signSpy = jest.spyOn(authService, 'sign').mockResolvedValue({
        payload: mockPayload,
        token: 'fake-token'
      });
      const cookieSpy = jest.spyOn(res, 'cookie');

      const result = await controller.login(dto, res);

      expect(signSpy).toHaveBeenCalledWith(dto);
      expect(cookieSpy).toHaveBeenCalledWith(
        'access_token',
        'fake-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({ message: 'Login Success', payload: mockPayload });
    });
  });

  describe('logout', () => {
    it('should clear cookie and return message', () => {
      const clearCookieSpy = jest.spyOn(res, 'clearCookie');

      const result = controller.logout(res);

      expect(clearCookieSpy).toHaveBeenCalledWith('access_token');
      expect(result).toEqual({ message: 'Logout success' });
    });
  });

  describe('getProfile', () => {
    it('should return req.user', () => {
      const req = {
        user: { id: 'uuid', username: 'jeremi' }
      } as unknown as Request;

      const result = controller.getProfile(req);

      expect(result).toEqual(req.user);
    });
  });
});