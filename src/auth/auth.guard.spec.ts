import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UsersService } from '@modules/users/users.service';
import { Payload } from '@auth';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  const mockUsersService = {
    identify: jest.fn(),
  };

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access and attach user to request', () => {
    const mockPayload: Payload = { sub: '123' } as unknown as Payload;
    const mockRequest = {
      user: mockPayload,
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    mockUsersService.identify.mockReturnValue(mockUser);

    const result = guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockUsersService.identify).toHaveBeenCalledWith('123');
    expect(mockRequest.user).toBe(mockUser);
  });

  it('should handle different payload sub values', () => {
    const mockPayload: Payload = { sub: '456' } as unknown as Payload;
    const mockRequest = {
      user: mockPayload,
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    const differentUser = { ...mockUser, id: '456' };
    mockUsersService.identify.mockReturnValue(differentUser);

    void guard.canActivate(mockExecutionContext);

    expect(mockUsersService.identify).toHaveBeenCalledWith('456');
    expect(mockRequest.user).toBe(differentUser);
  });
});