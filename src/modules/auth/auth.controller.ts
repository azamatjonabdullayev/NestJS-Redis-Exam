import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from 'src/core/database/prisma.service';
import { RedisServise } from 'src/core/database/redis.service';
import { AuthService } from './auth.service';
import { PhoneDto } from './dto/phone-register.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { EmailDto } from '../email/dto/send-email.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private redis: RedisServise,
    private readonly prisma: PrismaService,
  ) {}

  @Post('send-otp')
  async sendOtpUser(@Body() phoneNumber: PhoneDto) {
    const response = await this.authService.sendOtpUser(phoneNumber);
    return response;
  }

  @Post('verify-otp')
  async verifyOtp(
    @Res({ passthrough: true }) res: Response,
    @Body() verification_data: VerifyOtpDto,
  ) {
    const [sessionToken, phoneNumber] =
      await this.authService.verifyOtpUser(verification_data);

    res.cookie('_#sessionToken', sessionToken, {
      maxAge: 10 * 60 * 1000,
    });

    res.cookie('_#phoneNumber', phoneNumber, {
      maxAge: 10 * 60 * 1000,
    });

    return {
      message: 'Your number is successfully verified! Now you can register',
    };
  }

  @Get('verify-email')
  async verifyEmail(@Query('session') session: string) {
    const exists = await this.redis.getEmailSession(session);

    if (!exists) throw new BadRequestException('Invalid email');

    const email = session.split(':')[1];

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new BadRequestException('Invalid email');

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isEmailVerified: true,
      },
    });
    await this.redis.delEmailSession(session);

    return {
      message: 'Your email is successfully verified!',
    };
  }

  @Post('resend-email')
  async resendEmail(@Query('email') email: EmailDto) {
    return await this.authService.resendEmailVerif(email.email);
  }

  @Post('register')
  async register(
    @Body() registerData: RegisterDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const sessionToken = req.cookies['_#sessionToken'];
    const phoneNumber = req.cookies['_#phoneNumber'];

    if (!sessionToken || !phoneNumber)
      throw new BadRequestException('Invalid token!');

    const { token, emailSession } = await this.authService.register(
      registerData,
      sessionToken,
      phoneNumber,
    );

    res.clearCookie('_#sessionToken');
    res.clearCookie('_#phoneNumber');

    res.cookie('authToken', token, {
      maxAge: 1.1 * 3600 * 1000,
    });
    return {
      message:
        'You have succesfully registered! Now you can verify your email by clicking the link in the email we sent you.',
    };
  }

  @Post('login')
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() loginData: LoginDto,
  ) {
    const token = await this.authService.login(loginData);

    res.cookie('authToken', token, {
      maxAge: 1.1 * 3600 * 1000,
    });
    return {
      message: 'You have succesfully logged in!',
    };
  }
}
