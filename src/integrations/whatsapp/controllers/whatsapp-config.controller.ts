import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { CreateWhatsAppConfigDto, UpdateWhatsAppConfigDto } from '../dto/whatsapp-config.dto';
import { WhatsAppConfigService } from '../services/whatsapp-config.service';

@Controller('whatsapp/config')
export class WhatsAppConfigController {
  constructor(private readonly configService: WhatsAppConfigService) { }

  @Post()
  create(@Body() createDto: CreateWhatsAppConfigDto) {
    return this.configService.create(createDto);
  }

  @Get(':businessId')
  findOne(@Param('businessId') businessId: string) {
    return this.configService.findByBusinessId(businessId);
  }

  @Patch(':businessId')
  update(@Param('businessId') businessId: string, @Body() updateDto: UpdateWhatsAppConfigDto) {
    return this.configService.updateByBusinessId(businessId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configService.remove(id);
  }

  @Get(':businessId/test-connection')
  async testConnection(@Param('businessId') businessId: string) {
    const success = await this.configService.testConnection(businessId);
    return { success, message: 'Connection successful' };
  }
}