import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/database/prisma.service';
import { OtpService } from '../OTP/otp.service';
import { CreateAuthDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private otp: OtpService,
  ) {}

  async sendOtpUser(authDto: Partial<CreateAuthDto>) {
    const findUser = await this.prisma.user.findFirst({
      where: {
        phoneNumber: authDto.phone_number,
      },
    });

    if (findUser) throw new ConflictException('User already exists');

    const res = await this.otp.sendOtp(authDto.phone_number as string);

    if (!res) throw new InternalServerErrorException('Server error');

    return {
      message: 'Code sended successfully',
    };
  }

  async verifyOtpUser(data: VerifyOtpDto) {
    const sessionToken = await this.otp.verifySendedUserOtp(
      data.phone_number,
      data.code,
    );

    return {
      success: true,
      statusCode: 200,
      sessionToken,
    };
  }

  async register(authDto: CreateAuthDto) {
    const findUser = await this.prisma.user.findFirst({
      where: {
        phoneNumber: authDto.phone_number,
      },
    });

    if (findUser) throw new ConflictException('phone_number already exists');

    await this.otp.checkSessionToken(
      authDto.phone_number,
      authDto.session_token,
    );

    const hashedPassword = await bcrypt.hash(authDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: 'test',
        firstName: 'test',
        lastName: 'test',
        userName: 'test',
        password: hashedPassword,
        phoneNumber: authDto.phone_number,
      },
    });

    const token = this.jwtService.sign({
      id: user.id,
      role: user.role,
    });

    await this.otp.delSessionTokenUser(authDto.phone_number);

    return token;
  }
}
