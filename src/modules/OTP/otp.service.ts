import { BadRequestException, Injectable } from '@nestjs/common';
import { RedisServise } from 'src/core/database/redis.service';
import { SmsService } from './sms.service';
import { generateOTP } from 'src/tools/otp.tool';
import { generateUUID } from 'src/tools/uuid-token.tool';
import { VerifyOtpDto } from '../auth/dto/verify-otp.dto';

@Injectable()
export class OtpService {
  constructor(
    private readonly redisService: RedisServise,
    private readonly smsService: SmsService,
  ) {}

  async checkOtpExists(phoneNumber: string) {
    return await this.redisService.getOtp(phoneNumber);
  }

  async sendOtp(phoneNumber: string) {
    const otp = await this.checkOtpExists(phoneNumber);

    if (otp) {
      const ttl = await this.redisService.getTTL(phoneNumber);
      throw new BadRequestException(
        `Code is already sent, please try again after ${ttl} seconds`,
      );
    }

    const tempGenOtp = generateOTP();

    const redisResponse = await this.redisService.setOtp(
      phoneNumber,
      tempGenOtp,
    );

    await this.smsService.sendSms(phoneNumber, tempGenOtp);
    return true;
  }

  async verifySendedUserOtp(verification_data: VerifyOtpDto) {
    const otp = await this.checkOtpExists(verification_data.phone_number);

    if (!otp) {
      throw new BadRequestException("Code doesn't exist!");
    }

    if (otp !== verification_data.code) {
      throw new BadRequestException('Invalid code!');
    }

    await this.redisService.deleteOtp(verification_data.phone_number);
    const sessionToken = generateUUID();

    await this.redisService.setSessionToken(
      verification_data.phone_number,
      sessionToken,
    );

    const phoneNumber = verification_data.phone_number;

    return [sessionToken, phoneNumber];
  }

  async checkSessionToken(phoneNumber: string, token: string) {
    const sessionToken: string = (await this.redisService.getSessionToken(
      phoneNumber,
    )) as string;
    if (!sessionToken || sessionToken !== token)
      throw new BadRequestException('session token expired');
  }

  async delSessionTokenUser(phoneNumber: string) {
    await this.redisService.delSessionToken(phoneNumber);
  }
}
