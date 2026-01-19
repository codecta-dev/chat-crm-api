import { Response } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthUser } from '@auth';
import { IdentifyGuard } from './guards/identify.guard';
import { userFactory } from '@factories';
import { MemberService } from '@modules/member/member.service';

describe('AuthController', () => {
  let controller: AuthController;
  let res: jest.Mocked<Response>;

  const mocks = {
    authService: {
      sign: jest.fn(),
    },
    identityGuard: {
      canActivate: jest.fn(),
    },
    memberService: {
      getCompanies: jest.fn()
    },
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mocks.authService,
        },
        {
          provide: MemberService,
          useValue: mocks.memberService,
        },
      ],
    })
      .overrideGuard(IdentifyGuard)
      .useValue(mocks.identityGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);

    res = {
      cookie: mocks.cookie,
      clearCookie: mocks.clearCookie,
    } as unknown as jest.Mocked<Response>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call AuthService.sign and set cookie', async () => {
      const dto: LoginDto = { username: 'jeremi', password: '1234' };

      mocks.authService.sign.mockResolvedValue('fake-token');

      const result = await controller.login(dto, res);

      expect(mocks.authService.sign).toHaveBeenCalledWith(dto);
      expect(mocks.cookie).toHaveBeenCalledWith(
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

      expect(mocks.clearCookie).toHaveBeenCalledWith('access_token');
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