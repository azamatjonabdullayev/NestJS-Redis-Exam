import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './core/core.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [AuthModule, CoreModule, EmailModule],
})
export class AppModule {}
