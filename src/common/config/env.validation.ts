import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNotEmpty()
  @IsString()
  DATABASE_URL: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN?: string;

  @IsNumber()
  PORT?: number;

  @IsString()
  CORS_ORIGINS?: string;

  @IsString()
  FRONTEND_URL?: string;

  @IsString()
  STRIPE_SECRET_KEY?: string;

  @IsString()
  SMTP_HOST?: string;

  @IsNumber()
  SMTP_PORT?: number;

  @IsString()
  SMTP_USER?: string;

  @IsString()
  SMTP_PASS?: string;

  @IsString()
  SMTP_FROM?: string;

  @IsString()
  TWILIO_ACCOUNT_SID?: string;

  @IsString()
  TWILIO_AUTH_TOKEN?: string;

  @IsString()
  TWILIO_PHONE_NUMBER?: string;

  @IsNotEmpty()
  @IsString()
  ENCRYPTION_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: true,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
