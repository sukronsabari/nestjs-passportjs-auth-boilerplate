import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { Match } from '@/decorators/validation/match.decorator';

export enum AllowedRegisteredRole {
  USER = 'USER',
}

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @Match('password')
  @IsString()
  @IsNotEmpty()
  password_confirmation: string;

  @IsEnum(AllowedRegisteredRole)
  @IsString()
  @IsNotEmpty()
  role: Role;
}
