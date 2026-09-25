import { isUnique } from '@utils/validators';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";
import { i18nValidationMessage as t } from "nestjs-i18n";

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: t('validations.username'),
  })
  @isUnique({ tableName: 'users', column: 'username' })
  username: string;

  @IsString()
  @IsOptional()
  firstNames?: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  lastNames?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(8)
  password: string;
}
