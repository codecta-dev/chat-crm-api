import { Body, Controller, Get, Patch, Post, UseFilters, UseGuards } from "@nestjs/common";
import { CreateWhatsAppConfigDto, UpdateWhatsAppConfigDto } from "../dto/whatsapp-config.dto";
import { JwtAuthGuard } from "@auth/guards";
import { CompanyGuard } from "@modules/company/company.guard";
import { WhatsAppService } from "../whatsapp.service";
import { WhatsAppExceptionFilter } from "../filters/whatsapp-exception.filter";

@Controller('integration/whatsapp')
@UseGuards(JwtAuthGuard, CompanyGuard)
@UseFilters(new WhatsAppExceptionFilter())
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

  @Post('text/send')
  async sendTest(@Body('to') to: string, @Body('body') body: string) {
    return await this.service.sendText(to, body);
  }
}