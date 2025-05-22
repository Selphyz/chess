import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  @Length(4, 20)
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(6, 100)
  password: string;
}