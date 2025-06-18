import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[^@]/, {
    message: "Username must not have '@' character",
  })
  @MaxLength(100)
  userName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 25)
  @IsStrongPassword()
  password: string;
}
