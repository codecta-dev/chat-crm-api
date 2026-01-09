import { Response } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthUser } from '@auth';
import { IdentifyGuard } from './guards/identify.guard';
import { userFactory } from '@factories';

describe('AuthController', () => {
  let controller: AuthController;
  let res: jest.Mocked<Response>;
  let mockCookie: jest.Mock;
  let mockClearCookie: jest.Mock;

  const mockAuthService = {
    sign: jest.fn(),
  };

  const mockIdentifyGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(IdentifyGuard)
      .useValue(mockIdentifyGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);

    mockCookie = jest.fn().mockReturnThis();
    mockClearCookie = jest.fn().mockReturnThis();

    res = {
      cookie: mockCookie,
      clearCookie: mockClearCookie,
    } as unknown as jest.Mocked<Response>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call AuthService.sign and set cookie', async () => {
      const dto: LoginDto = { username: 'jeremi', password: '1234' };

      mockAuthService.sign.mockResolvedValue('fake-token');

      const result = await controller.login(dto, res);

      expect(mockAuthService.sign).toHaveBeenCalledWith(dto);
      expect(mockCookie).toHaveBeenCalledWith(
        'access_token',
        'fake-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({
        message: 'Login Success',
      });
    });
  });

  describe('logout', () => {
    it('should clear cookie and return message', () => {
      const result = controller.logout(res);

      expect(mockClearCookie).toHaveBeenCalledWith('access_token');
      expect(result).toEqual({ message: 'Logout success' });
    });
  });

  describe('getProfile', () => {
    it('should return user from decorator', () => {
      const mockUser = userFactory.build() as AuthUser;

      const result = controller.getProfile(mockUser);

      expect(result).toEqual(mockUser);
    });
  });
});