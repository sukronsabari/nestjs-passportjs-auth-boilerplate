import { TokenPayload } from '@/interfaces/token-payload.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  /**
   *
   * @param data => parameter yang dikirim dari decorator
   * @param ctx => context object yang berisi context incoming request
   * @returns => return object/specific property user yang di assign dari guard auth
   */
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as TokenPayload;

    return data ? user[data] : user;
  },
);
