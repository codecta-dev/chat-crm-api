export type AuthUser = {
  id: string;
  username: string;
  role: string;
  avatar?: string;
};

export type JwtPayload = {
  sub?: string;
  user: AuthUser;
};

export type AuthResponse = {
  access_token: string;
  payload: JwtPayload;
}