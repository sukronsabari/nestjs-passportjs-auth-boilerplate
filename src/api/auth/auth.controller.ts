import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';

import { AuthService } from './auth.service';

import { GoogleOAuthGuard } from '@/guards/google-oauth.guard';
import { LocalAuthGuard } from '@/guards/local-auth.guard';
import { User } from '@/decorators/user.decorator';
import { Auth } from '@/decorators/auth.decorator';

import { RegisterDto } from './dto/register.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

import { ApiResponse } from '@/interfaces/api-response.interface';
import { TokenPayload } from '@/interfaces/token-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private i18n: I18nService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() body: RegisterDto): Promise<ApiResponse> {
    await this.authService.register(body);

    return {
      statusCode: HttpStatus.OK,
      message: this.i18n.t('messages.user_registered_successfully'),
    };
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Req() req: Request): Promise<ApiResponse> {
    const tokenPayload = req.user as TokenPayload;
    const token = await this.authService.login(tokenPayload);

    return {
      statusCode: HttpStatus.OK,
      message: this.i18n.t('messages.user_logged_in'),
      data: {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
      },
    };
  }

  @UseGuards(GoogleOAuthGuard)
  @Get('google/login')
  async loginGoogle() {
    return 'Login process....';
  }

  @UseGuards(GoogleOAuthGuard)
  @Get('google/redirect')
  async redirectLoginGoogle(@Req() req: Request): Promise<ApiResponse> {
    const tokenPayload = req.user as TokenPayload;
    const accessToken = await this.authService.loginGoogle(tokenPayload);

    return {
      statusCode: HttpStatus.OK,
      message: 'Logged in with google',
      data: {
        access_token: accessToken,
      },
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenDto): Promise<ApiResponse> {
    const newAccessToken = await this.authService.refreshToken(
      body.refresh_token,
    );

    return {
      statusCode: HttpStatus.OK,
      message: this.i18n.t('messages.refresh_token_success'),
      data: {
        access_token: newAccessToken,
      },
    };
  }

  @HttpCode(HttpStatus.OK)
  @Auth()
  @Post('logout')
  async logout(
    @Body() body: LogoutDto,
    @User() user: TokenPayload,
  ): Promise<ApiResponse> {
    await this.authService.logout(body.refresh_token, user.sub);

    return {
      statusCode: HttpStatus.OK,
      message: this.i18n.t('messages.user_logged_out'),
    };
  }
}
