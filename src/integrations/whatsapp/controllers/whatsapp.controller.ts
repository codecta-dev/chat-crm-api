import { Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { CreateWhatsAppConfigDto, UpdateWhatsAppConfigDto } from "../dto/whatsapp-config.dto";
import { JwtAuthGuard } from "@auth/guards";
import { CompanyGuard } from "@modules/company/company.guard";
import { WhatsAppService } from "../whatsapp.service";

@Controller('integration/whatsapp')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class WhatsappController {
  constructor(private readonly service: WhatsAppService) { }

  @Get('config')
  getConfig() {
    return this.service.getConfig();
  }

  @Post()
  create(dto: CreateWhatsAppConfigDto) {
    return this.service.createConfig(dto);
  }

  @Patch()
  update(dto: UpdateWhatsAppConfigDto) {
    return this.service.updateConfig(dto);
  }
}