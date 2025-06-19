import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { UUID } from 'crypto';
import Redis from 'ioredis';

@Injectable()
export class RedisServise implements OnModuleInit, OnModuleDestroy {
  protected redis: Redis;
  private readonly expirationSeconds = 180;
  private key = 'user:';
  private sessionKey = 'session:';
  private emailKey = 'email:';

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

  async setSessionToken(phoneNumber: string, token: UUID) {
    await this.redis.setex(this.sessionKey + phoneNumber, 600, token);
    return true;
  }

  async getSessionToken(phoneNumber: string) {
    return await this.redis.get(this.sessionKey + phoneNumber);
  }

  async delSessionToken(phoneNumber: string) {
    await this.redis.del(this.sessionKey + phoneNumber);
  }

  async setEmailSession(email: string, token: UUID) {
    await this.redis.setex(this.emailKey + email, 600, token);
    return this.emailKey + email;
  }

  async getEmailSession(email: string) {
    return await this.redis.get(email);
  }

  async delEmailSession(email: string) {
    await this.redis.del(this.emailKey + email);
  }
}
