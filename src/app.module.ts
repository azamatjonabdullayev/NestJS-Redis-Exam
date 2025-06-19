import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { MoviesModule } from './modules/movies/movies.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [AuthModule, CoreModule, MoviesModule, UsersModule],
})
export class AppModule {}
