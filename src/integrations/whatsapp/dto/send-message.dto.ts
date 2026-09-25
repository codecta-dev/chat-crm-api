import { IsString, IsNotEmpty, IsPhoneNumber } from "class-validator";

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('PE', { message: 'Número de teléfono inválido' })
  to: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}