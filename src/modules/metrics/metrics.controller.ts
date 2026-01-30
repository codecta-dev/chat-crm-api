import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MetricsService } from './metrics.service';
import { type AuthUser, CurrentUser } from '@auth';
import { CompareQuery } from './dtos/compare-query.dto';

@Controller('metrics')
@UseGuards(AuthGuard('jwt'))
export class MetricsController {
  constructor(private readonly service: MetricsService) { }

  @Get('compare')
  @HttpCode(HttpStatus.OK)
  async compare(@Query() { period = 'month' }: CompareQuery) {
    return this.service.getCompares({ period });
  }

  @Get("sentiment/monthly-trend")
  @HttpCode(HttpStatus.OK)
  async getMonthlyTrend() {
    return this.service.getMonthlySentimentTrend();
  }

  @Get("sentiment/trend")
  @HttpCode(HttpStatus.OK)
  async getSentimentTrend(@Query("range") range: 'day' | 'week' | 'month' | 'year', @Query("userId") userId: string) {
    return this.service.getSentimentTrendByRange(range, userId);
  }

  @Get("top-contacts")
  @HttpCode(HttpStatus.OK)
  async getTopContacts() {
    return this.service.getTopContacts();
  }

  @Get("best-agents")
  @HttpCode(HttpStatus.OK)
  async getBestAgents() {
    return this.service.getAgentsFast('POS');
  }

  @Get("bad-agents")
  @HttpCode(HttpStatus.OK)
  async getBadAgents() {
    return this.service.getAgentsFast('NEG');
  }

  @Get("best-clients")
  @HttpCode(HttpStatus.OK)
  async getBestClients(@CurrentUser('id') userId: AuthUser['id']) {
    return this.service.getBestClients(userId);
  }
}
