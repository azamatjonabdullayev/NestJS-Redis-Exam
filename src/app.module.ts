import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [AuthModule, CoreModule],
})
export class AppModule {}
