import { isUnique } from '@utils/validators';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MinLength } from "class-validator";
import { i18nValidationMessage as t } from "nestjs-i18n";
import { Company } from '../../companies/entities/company.entity';
import { IsInDatabase } from '@utils/validators/IsInDatabase';
import type { UserRole } from '../entities/user.entity';

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

  @IsString()
  role: UserRole

  @IsUUID()
  @IsNotEmpty()
  @IsInDatabase(Company, 'id')
  companyId: string;
}
