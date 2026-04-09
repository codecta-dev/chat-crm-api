import { Module } from "@nestjs/common";
import { WhatsappModule } from "./whatsapp/whatsapp.module";

export {
  WhatsappModule,
}

export const modules = [
  WhatsappModule
]

@Module({
  imports: modules,
  exports: modules
}) export class IntegrationsModules { }