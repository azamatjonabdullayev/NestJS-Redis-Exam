import { Controller, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('test')
  async testSend(@Query('to') to: string) {
    await this.emailService.sendTestEmail(to);
    return { message: `Письмо отправлено на ${to}` };
  }
}
