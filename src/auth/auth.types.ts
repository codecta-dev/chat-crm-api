export type AuthUser = {
  id: string;
  username: string;
  role: string;
  avatar?: string;
  /** 
   * @deprecated Use user.company instead 
   */
  companyId?: string;
};

export type JwtPayload = {
  sub?: string;
  user: AuthUser;
};

export type AuthResponse = {
  access_token: string;
  payload: JwtPayload;
}