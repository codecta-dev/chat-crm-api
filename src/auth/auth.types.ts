import { User } from "@modules/users/entities/user.entity";

type UserAuthOmittedKeys = 'createdAt' | 'updatedAt' | 'deletedAt' | 'chats' | 'notifications' | 'hashPassword';

export type AuthUser = Omit<User, UserAuthOmittedKeys>

export type JwtPayload = {
  sub: string;
  company: string;
};

export type AuthResponse = {
  access_token: string;
  payload: JwtPayload;
}