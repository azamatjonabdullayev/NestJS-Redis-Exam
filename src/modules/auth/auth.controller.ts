import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Request, Response } from 'express';
import { PhoneDto } from './dto/phone-register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Post('register')
  async register(
    @Body() registerData: RegisterDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const sessionToken = req.cookies['_#sessionToken'];
    const phoneNumber = req.cookies['_#phoneNumber'];

    if (!sessionToken || !phoneNumber)
      throw new BadRequestException('Your session has expired or is invalid.');

    const token = await this.authService.register(
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
      message: 'You have succesfully registered!',
    };
  }
}
