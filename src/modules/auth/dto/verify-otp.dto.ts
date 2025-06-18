import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998\d{9}$/, {
    message: 'Phone number should match pattern +998xxxxxxxxx',
  })
  phone_number: string;

  @IsString()
  @IsNotEmpty({ message: 'Code is required' })
  @MaxLength(6, {
    message: 'Code length must be 6 characters',
  })
  code: string;
}
