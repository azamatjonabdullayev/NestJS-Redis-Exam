import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { type UUID, randomUUID } from 'crypto';
import { RedisServise } from 'src/core/database/redis.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly redis: RedisServise,
  ) {}

  async sendVerificationEmail(toEmail: string) {
    const emailSession: UUID = randomUUID();
    const sessionKey = await this.redis.setEmailSession(toEmail, emailSession);
    await this.mailerService.sendMail({
      to: toEmail,
      from: process.env.USER_MAIL,
      subject: 'Verify your email',
      html: `
          <a
            href="http://localhost:4000/auth/verify-email?session=${sessionKey}"
            style="
            display: inline-block;
            background-color: #5cb338;
            color: #fff8f8;
            padding: 10px 20px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: bold;
            text-align: center;"
          >
            Verify Email
          </a>
        `,
    });

    return {
      message: 'Email sent successfully!',
      session: sessionKey,
    };
  }
}
