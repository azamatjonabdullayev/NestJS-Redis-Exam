import {
  Injectable,
  InternalServerErrorException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      throw new InternalServerErrorException(`Prisma error:${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma disconnected');
    process.exit(1);
  }
}
