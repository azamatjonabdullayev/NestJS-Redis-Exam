import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class PhoneDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998\d{9}$/, {
    message: 'Phone number should match pattern +998xxxxxxxxx',
  })
  phone_number: string;
}
