import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { UUID } from 'crypto';
import { PrismaService } from 'src/core/database/prisma.service';
import { EmailService } from '../email/email.service';
import { OtpService } from '../OTP/otp.service';
import { PhoneDto } from './dto/phone-register.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private otp: OtpService,
    private emailService: EmailService,
  ) {}

  async sendOtpUser(phone: PhoneDto) {
    const isSent = await this.otp.checkOtpExists(phone.phone_number);

    if (isSent) throw new BadRequestException('Code is already sent');

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
        status: 'ACTIVE',
      },
    });

    const token = this.jwtService.sign({
      id: user.id,
      role: user.role,
    });

    const { session: emailSession } =
      await this.emailService.sendVerificationEmail(authDto.email);

    await this.otp.delSessionTokenUser(phoneNumber);

    return { token, emailSession };
  }

  async resendEmailVerif(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new BadRequestException('User not found');

    if (user.isEmailVerified)
      throw new BadRequestException('Email already verified');

    await this.emailService.sendVerificationEmail(email);

    return {
      message: 'Email sent successfully',
    };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) throw new BadRequestException('User not found');

    const comparePassword = await bcrypt.compare(data.password, user.password);

    if (!comparePassword) throw new BadRequestException('Invalid password');

    const token = await this.jwtService.signAsync({
      id: user.id,
      role: user.role,
    });

    return token;
  }
}
