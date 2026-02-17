import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString, IsUrl, IsUUID, Matches } from 'class-validator';

export class CreateWhatsAppConfigDto {
  @IsString()
  businessId: string;

  @IsString()
  accessToken: string;

  @IsString()
  phoneNumberId: string;

  @IsString()
  webhookUrl: string;

  @IsOptional()
  @Matches(/^v\d{2}\.\d$/)
  apiVersion: string;

  @IsOptional()
  @IsUrl()
  apiBaseUrl: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsUUID()
  companyId: string;
}

export class UpdateWhatsAppConfigDto extends PartialType(CreateWhatsAppConfigDto) { }