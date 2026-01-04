import { ExecutionContext } from '@nestjs/common';
import { factory } from './user.decorator';
import { AuthUser, JwtPayload } from '../auth.types';

describe('extractUser', () => {
  const authUser: AuthUser = {
    id: '123',
    username: 'jeremi',
    role: 'admin',
    avatar: 'avatar.png',
  };

  const jwtPayload: JwtPayload = { sub: 'sub-123', user: authUser };

  const mockContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ user: jwtPayload }),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }),
  } as unknown as ExecutionContext;

  it('returns full user when no data is provided', () => {
    expect(factory(undefined, mockContext)).toEqual(authUser);
  });

  it('returns user id when data is "id"', () => {
    expect(factory('id', mockContext)).toBe(authUser.id);
  });

  it('returns user role when data is "role"', () => {
    expect(factory('role', mockContext)).toBe(authUser.role);
  });

  it('returns undefined if user is missing', () => {
    const badContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: { sub: 'sub-123', user: undefined } }),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
    } as unknown as ExecutionContext;

    expect(factory(undefined, badContext)).toBeUndefined();
  });
});
