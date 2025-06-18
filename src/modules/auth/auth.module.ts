import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OtpModule } from '../OTP/otp.module';

@Module({
  imports: [OtpModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
