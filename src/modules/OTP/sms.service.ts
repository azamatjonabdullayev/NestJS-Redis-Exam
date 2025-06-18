import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { ENDPOINTS } from 'src/common/constants/endpoint';

@Injectable()
export class SmsService {
  private readonly eskizEmail = process.env.ESKIZ_EMAIL as string;
  private readonly eskizPassword = process.env.ESKIZ_PASSWORD as string;

  async getEskizToken() {
    try {
      const tokenUrl = ENDPOINTS.getEskizTokenUrl() as string;
      const formData = new FormData();
      formData.set('email', this.eskizEmail);
      formData.set('password', this.eskizPassword);

      const {
        data: {
          data: { token },
        },
      } = await axios.post(tokenUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return token;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async sendSms(phoneNumber: string, otp: string) {
    const smsUrl = ENDPOINTS.getSmsUrl() as string;
    const token = await this.getEskizToken();

    const formData = new FormData();
    formData.set('mobile_phone', phoneNumber);
    formData.set('message', `StudyHub ilovasiga kirish kodi:${otp}`);
    formData.set('from', '4546');

    const { status } = await axios.post(smsUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    if (status !== 200) {
      throw new InternalServerErrorException(
        `Send sms error! Status: ${status}`,
      );
    }
  }
}
