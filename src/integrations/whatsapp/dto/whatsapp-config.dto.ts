import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsUrl, Matches } from 'class-validator';

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
}

export class UpdateWhatsAppConfigDto extends PartialType(CreateWhatsAppConfigDto) { }