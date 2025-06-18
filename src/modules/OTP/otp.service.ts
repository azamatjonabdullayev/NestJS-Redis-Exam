import { BadRequestException, Injectable } from '@nestjs/common';
import { RedisServise } from 'src/core/database/redis.service';
import { SmsService } from './sms.service';
import { generateOTP } from 'src/tools/otp.tool';
import { generateUUID } from 'src/tools/uuid-token.tool';

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

    if (otp)
      throw new BadRequestException(
        'Code is already sent, please try again after some time',
      );

    const tempGenOtp = generateOTP();

    const redisResponse = await this.redisService.setOtp(
      phoneNumber,
      tempGenOtp,
    );

    if (redisResponse) {
      await this.smsService.sendSms(phoneNumber, tempGenOtp);
      return true;
    }
    return false;
  }

  async verifySendedUserOtp(phoneNumber: string, code: string) {
    const otp = await this.checkOtpExists(phoneNumber);

    if (!otp) {
      throw new BadRequestException("Code doesn't exist!");
    }

    if (otp !== code) {
      throw new BadRequestException('Invalid code!');
    }

    await this.redisService.deleteOtp(phoneNumber);
    const sessionToken = generateUUID();

    await this.redisService.setSessionToken(phoneNumber, sessionToken);

    return sessionToken;
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
