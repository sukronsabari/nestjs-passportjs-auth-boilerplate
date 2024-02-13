import { AppConfig } from './env.validation';

export const config = (): AppConfig => ({
  NODE_ENV: process.env.NODE_ENV,

  //  OAUTH GOOGLE
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,

  // TOKENIZE
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,

  // DATABASE
  DATABASE_URL: process.env.DATABASE_URL,
});
