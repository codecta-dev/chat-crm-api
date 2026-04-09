import { IsOptional, IsString, IsEmail, MaxLength } from 'class-validator';
import type { CompanyStatus } from '../entities/company.entity';

export class CreateCompanyDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  status?: CompanyStatus;
}

