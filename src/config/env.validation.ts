import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsString, validateSync } from 'class-validator';

export class AppConfig {
  @IsString()
  @IsNotEmpty()
  NODE_ENV: string;

  //  OAUTH GOOGLE
  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID: string;
  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET: string;
  @IsString()
  @IsNotEmpty()
  GOOGLE_CALLBACK_URL: string;

  // TOKENIZE
  @IsString()
  @IsNotEmpty()
  ACCESS_TOKEN_SECRET: string;
  @IsString()
  @IsNotEmpty()
  REFRESH_TOKEN_SECRET: string;

  // DATABASE
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(AppConfig, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
