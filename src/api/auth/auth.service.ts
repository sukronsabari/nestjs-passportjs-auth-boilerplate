import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  LoggerService,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { nanoid } from 'nanoid';
import { compare, hash } from 'bcrypt';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { TokenPayload } from '@/interfaces/token-payload.interface';
import { Token } from '@/interfaces/token.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  private async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    return user;
  }

  private async verifySignatureToken(
    refreshToken: string,
  ): Promise<TokenPayload> {
    const tokenPayload = await this.jwtService.verifyAsync<TokenPayload>(
      refreshToken,
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        ignoreExpiration: false,
      },
    );

    return tokenPayload;
  }

  public async register({
    name,
    email,
    password,
    role,
  }: RegisterDto): Promise<void> {
    if (role === Role.ADMIN) {
      throw new UnprocessableEntityException(
        'You cannot create an admin account directly',
      );
    }

    const findUser = await this.findUserByEmail(email);

    if (findUser) {
      throw new BadRequestException(this.i18n.t('errors.email_already_use'));
    }

    const hashedPassword = await hash(password, 10);
    await this.prismaService.user.create({
      data: {
        id: nanoid(),
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
  }

  async validateUser(email: string, password: string): Promise<TokenPayload> {
    const findUser = await this.findUserByEmail(email);

    if (!findUser) {
      throw new UnauthorizedException(
        this.i18n.t('errors.incorrect_email_password'),
      );
    }

    if (!findUser.verified_at) {
      throw new ForbiddenException(this.i18n.t('errors.in_active_account'));
    }

    if (!findUser.password) {
      throw new ForbiddenException(this.i18n.t('errors.invalid_login_method'));
    }

    const match = await compare(password, findUser.password);
    if (!match) {
      throw new UnauthorizedException(
        this.i18n.t('errors.incorrect_email_password'),
      );
    }

    const payload: TokenPayload = {
      sub: findUser.id,
      name: findUser.name,
      role: findUser.role,
    };

    return payload;
  }

  async login(tokenPayload: TokenPayload): Promise<Token> {
    const [refreshToken, accessToken] = await Promise.all([
      this.jwtService.signAsync(tokenPayload, {
        expiresIn: '7d',
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      }),
      this.jwtService.signAsync(tokenPayload, {
        expiresIn: '2d',
      }),
    ]);

    const { sub: userId } = tokenPayload;

    try {
      await this.prismaService.$transaction(async (tx) => {
        const findRefreshToken = await tx.tokenize.findFirst({
          where: { user_id: userId, status: 'ACTIVE' },
        });

        if (findRefreshToken) {
          await tx.tokenize.update({
            where: { id: findRefreshToken.id },
            data: {
              status: 'EXPIRED',
            },
          });
        }

        await tx.tokenize.create({
          data: { refresh_token: refreshToken, user_id: userId },
        });
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async validateUserWithGoogleOAuth(
    name: string,
    email: string,
  ): Promise<TokenPayload> {
    const user = await this.prismaService.user.upsert({
      create: {
        id: nanoid(),
        name,
        email,
        verified_at: new Date(),
        role: 'USER',
      },
      update: {},
      where: { email },
    });

    const payload: TokenPayload = {
      sub: user.id,
      name: user.name,
      role: user.role,
    };

    return payload;
  }

  async loginGoogle(tokenPayload: TokenPayload): Promise<string> {
    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      expiresIn: '7d',
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
    });

    return accessToken;
  }

  async refreshToken(refreshToken: string) {
    const tokenPayload = await this.verifySignatureToken(refreshToken);
    const findToken = await this.prismaService.tokenize.findUnique({
      where: { refresh_token: refreshToken, status: 'ACTIVE' },
    });

    if (!findToken) {
      throw new UnauthorizedException(this.i18n.t('errors.invalid_token'));
    }

    const newAccessToken = await this.jwtService.signAsync(tokenPayload);
    return newAccessToken;
  }

  public async logout(refreshToken: string, userId: string): Promise<void> {
    await this.verifySignatureToken(refreshToken);
    const findToken = await this.prismaService.tokenize.findUnique({
      where: {
        user_id: userId,
        refresh_token: refreshToken,
        status: 'ACTIVE',
      },
    });

    if (!findToken) {
      throw new UnauthorizedException(this.i18n.t('errors.invalid_token'));
    }

    await this.prismaService.tokenize.update({
      where: { id: findToken.id },
      data: {
        status: 'EXPIRED',
      },
    });
  }

  async changePassword() {}
}
