import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @MinLength(4)
  @MaxLength(254)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z)(?=.*[a-z]).*$/, {
    message: 'Password Too Weak',
  })
  password: string;
}
