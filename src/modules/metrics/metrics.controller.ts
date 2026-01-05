import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MetricsService } from './metrics.service';
import { type AuthUser, CurrentUser } from '@auth';

@Controller('metrics')
@UseGuards(AuthGuard('jwt'))
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) { }

  @Get("KPIs")
  @HttpCode(HttpStatus.OK)
  async getKpis() {
    const metrics = this.metricsService.kpis();
    return metrics;
  }

  @Get("sentiment/monthly-trend")
  @HttpCode(HttpStatus.OK)
  async getMonthlyTrend() {
    return this.metricsService.getMonthlySentimentTrend();
  }

  @Get("sentiment/trend")
  @HttpCode(HttpStatus.OK)
  async getSentimentTrend(@Query("range") range: 'day' | 'week' | 'month' | 'year', @Query("userId") userId: string) {
    return this.metricsService.getSentimentTrendByRange(range, userId);
  }

  @Get("top-contacts")
  @HttpCode(HttpStatus.OK)
  async getTopContacts() {
    return this.metricsService.getTopContacts();
  }

  @Get("best-agents")
  @HttpCode(HttpStatus.OK)
  async getBestAgents() {
    return this.metricsService.getBestAgentsFast();
  }

  @Get("bad-agents")
  @HttpCode(HttpStatus.OK)
  async getBadAgents() {
    return this.metricsService.getAgentsFast("NEG");
  }

  @Get("best-clients")
  @HttpCode(HttpStatus.OK)
  async getBestClients(@CurrentUser('id') userId: AuthUser['id']) {
    return this.metricsService.getBestClients(userId);
  }
}
