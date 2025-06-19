import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OtpModule } from '../OTP/otp.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [OtpModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
