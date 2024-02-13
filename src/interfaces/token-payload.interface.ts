export interface TokenPayload {
  sub: string;
  name: string;
  role: string;

  iat?: number;
  exp?: number;
}
