import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisServise implements OnModuleInit, OnModuleDestroy {
  protected redis: Redis;
  private readonly expirationSeconds = 180;
  private key = 'user:';
  private sessionKey = 'session:';
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.redis = new Redis({
      port: this.configService.get('REDIS_PORT'),
      host: this.configService.get('REDIS_HOST'),
    });
  }

  onModuleDestroy() {
    console.log('Redis disconnected');
    this.redis.disconnect();
    process.exit(1);
  }

  async getOtp(phoneNumber: string) {
    return await this.redis.get(this.key + phoneNumber);
  }

  async getTTL(phoneNumber: string) {
    return await this.redis.ttl(this.key + phoneNumber);
  }

  async setOtp(phoneNumber: string, otp: string) {
    await this.redis.setex(this.key + phoneNumber, this.expirationSeconds, otp);

    return true;
  }

  async deleteOtp(phoneNumber: string) {
    await this.redis.del(this.key + phoneNumber);

    return true;
  }

  async setSessionToken(phoneNumber: string, token: string) {
    await this.redis.setex(`session:${phoneNumber}`, 300, token);
    return true;
  }

  async getSessionToken(phoneNumber: string) {
    return await this.redis.get(this.sessionKey + phoneNumber);
  }

  async delSessionToken(phoneNumber: string) {
    await this.redis.del(this.sessionKey + phoneNumber);
  }
}
