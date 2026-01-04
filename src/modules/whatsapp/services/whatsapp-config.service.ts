import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PinoLogger } from 'nestjs-pino';
import { Repository } from 'typeorm';

import { Company } from '../../companies/entities/company.entity';
import { CreateWhatsAppConfigDto, UpdateWhatsAppConfigDto } from '../dto/whatsapp-config.dto';
import { WhatsAppConfig } from '../entities/whatsapp-config.entity';
import { WhatsAppConfigNotFoundException } from '../exceptions/whatsapp-config.exceptions';
import { WhatsAppInvalidConfigException } from '../exceptions/whatsapp.exceptions';
import { WhatsAppApiClient } from '../whatsapp-api.client';

@Injectable()
export class WhatsAppConfigService {
  constructor(
    @InjectRepository(WhatsAppConfig)
    private configRepository: Repository<WhatsAppConfig>,
    private readonly logger: PinoLogger,
    private readonly client: WhatsAppApiClient,
  ) {
    this.logger.setContext(WhatsAppConfigService.name)
  }

  async getActiveByCompany(companyId?: string): Promise<WhatsAppConfig> {
    return await this.configRepository.findOneOrFail({
      where: { company: { id: companyId }, isActive: true },
    });
  }

  async getActiveByVerifyToken(token: string) {
    return await this.configRepository.findOne({
      where: { webhookVerifyToken: token },
    })
  }

  async create(createDto: CreateWhatsAppConfigDto): Promise<WhatsAppConfig> {
    await this.configRepository.update({
      company: { id: createDto.companyId },
      isActive: true
    }, { isActive: false });

    const config = this.configRepository.create({
      ...createDto,
      company: { id: createDto.companyId } as Company,
    });

    return await this.configRepository.save(config);
  }

  async active(): Promise<WhatsAppConfig> {
    const config = await this.configRepository.findOne({
      where: { isActive: true }
    });

    if (!config) throw new WhatsAppConfigNotFoundException();

    return config;
  }

  async findByBusinessId(businessId: string): Promise<WhatsAppConfig> {
    const config = await this.configRepository.findOne({
      where: { businessId, isActive: true },
      relations: ['company'],
    });

    if (!config) throw new WhatsAppConfigNotFoundException();

    return config;
  }

  async updateByBusinessId(
    businessId: string,
    dto: UpdateWhatsAppConfigDto
  ): Promise<WhatsAppConfig> {
    const { companyId, ...data } = dto;

    let config = await this.configRepository.findOne({
      where: { businessId },
      relations: ['company'],
    });

    if (!config) {
      config = this.configRepository.create({ businessId });
    }

    this.configRepository.merge(config, data);

    if (companyId) {
      config.company = { id: companyId } as Company;
    }

    return await this.configRepository.save(config);
  }

  async update(id: string, updateDto: UpdateWhatsAppConfigDto): Promise<WhatsAppConfig | null> {
    await this.configRepository.update(id, updateDto);
    return await this.configRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.configRepository.update(id, { isActive: false });
  }

  async testConnection(businessId: string): Promise<boolean> {
    const config = await this.findByBusinessId(businessId);
    const url = this.buildApiUrl(config);

    if (!this.isValidConfig(config)) throw new WhatsAppInvalidConfigException(businessId);

    return this.client.testConnection(url);
  }

  private isValidConfig(config: Partial<WhatsAppConfig>): boolean {
    return !!(config?.apiBaseUrl && config?.apiVersion && config?.phoneNumberId && config?.accessToken);
  }

  private buildApiUrl(config: WhatsAppConfig): string {
    return `${config.apiBaseUrl}/${config.apiVersion}/debug_token?input_token=${config.accessToken}&access_token=${config.accessToken}`;
  }
}