import { NotFoundException } from "@nestjs/common";

export class WhatsAppConfigNotFoundException extends NotFoundException {
  constructor() {
    super("No hay configuración activa de WhatsApp");
  }
}