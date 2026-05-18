export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

export type JwtRefreshPayload = JwtPayload & {
  refreshToken: string;
};
