export type JwtPayload = {
  sub?: string;
  user: Partial<{
    id: string | number
    username: string;
    role: string;
    avatar: string | undefined;
  }>
};

export type AuthResponse = {
  access_token: string;
  payload: JwtPayload;
}