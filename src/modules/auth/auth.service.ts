import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/database/prisma.service';
import { OtpService } from '../OTP/otp.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as bcrypt from 'bcrypt';
import { PhoneDto } from './dto/phone-register.dto';
import type { UUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private otp: OtpService,
  ) {}

  async sendOtpUser(phone: PhoneDto) {
    const findUser = await this.prisma.user.findFirst({
      where: {
        phoneNumber: phone.phone_number,
      },
    });

    if (findUser) throw new ConflictException('User already exists');

    const res = await this.otp.sendOtp(phone.phone_number as string);

    if (!res) throw new InternalServerErrorException('Server error');

    return {
      message: 'Code sended successfully',
    };
  }

  async verifyOtpUser(data: VerifyOtpDto) {
    const [sessionToken, phoneNumber] =
      await this.otp.verifySendedUserOtp(data);

    return [sessionToken, phoneNumber];
  }

  async register(
    authDto: RegisterDto,
    sessionToken: UUID,
    phoneNumber: string,
  ) {
    const findUser = await this.prisma.user.findUnique({
      where: {
        userName: '@' + authDto.userName,
      },
    });

    if (findUser) throw new ConflictException('User already exists');

    const findEmail = await this.prisma.user.findUnique({
      where: {
        email: authDto.email,
      },
    });

    if (findEmail) throw new ConflictException('Email already exists');

    await this.otp.checkSessionToken(phoneNumber, sessionToken);

    const hashedPassword = await bcrypt.hash(authDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        firstName: authDto.firstName,
        lastName: authDto.lastName,
        userName: '@' + authDto.userName,
        email: authDto.email,
        password: hashedPassword,
        phoneNumber: phoneNumber,
        isPhoneVerified: true,
      },
    });

    const token = this.jwtService.sign({
      id: user.id,
      role: user.role,
    });

    await this.otp.delSessionTokenUser(phoneNumber);

    return token;
  }
}
