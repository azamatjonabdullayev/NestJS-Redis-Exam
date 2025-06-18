import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RedisServise } from './redis.service';

@Global()
@Module({
  providers: [PrismaService, RedisServise],
  exports: [PrismaService, RedisServise],
})
export class DatabaseModule {}
