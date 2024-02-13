import {
  ExecutionContext,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { LoginDto } from '@/api/auth/dto/login.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * @description
 * use this guard to check user credentials (login)
 * this guard will automatically inject the value resulting from the validate function on LocalStrategy (in this project, validate on local strategy produces jwt tokens) into req.user
 */

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const dto = plainToClass(LoginDto, request.body);
    const errors = await validate(dto, {
      skipMissingProperties: false,
      forbidNonWhitelisted: true,
      whitelist: true,
    });

    if (errors?.length) {
      console.log(errors);
      const messages = errors.map((error) => {
        const constraint = error?.constraints;
        return Object.values(constraint)[0];
      });

      throw new UnprocessableEntityException(messages);
    }

    return super.canActivate(context) as boolean;
  }
}
