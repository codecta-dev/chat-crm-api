import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from 'class-transformer';

export class UserSearchDto {
  @IsString()
  @IsOptional()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10;
}