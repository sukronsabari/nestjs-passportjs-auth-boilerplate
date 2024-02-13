import { PrismaService } from '@/api/prisma/prisma.service';
import { TokenPayload } from '@/interfaces/token-payload.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly i18n: I18nService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    const { sub } = payload;

    const findUser = await this.prismaService.user.findUnique({
      where: { id: sub },
    });

    if (!findUser) {
      throw new UnauthorizedException(this.i18n.t('errors.invalid_token'));
    }

    return payload;
  }
}
