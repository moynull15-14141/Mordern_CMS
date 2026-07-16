import { Controller, Get, HttpCode, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../core/responses/api-response.swagger';
import { Public } from '../identity/decorators/public.decorator';
import { AppInfoDto } from './dto/app-info.dto';
import { LivenessStatusDto } from './dto/liveness-status.dto';
import { ReadinessStatusDto } from './dto/readiness-status.dto';
import { HealthService } from './health.service';

/**
 * Health (application info), readiness, and liveness endpoints per
 * 20_BACKEND_ARCHITECTURE.md §18, refined in Milestone 2.1 into three
 * distinct probes. All sit under the global /api/v1 prefix like every other
 * route for consistency. Marked @Public() (Milestone 4) since JwtAuthGuard
 * is now global — infra health checks must never require a token.
 */
@ApiTags('Health')
@Public()
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Application information (no dependency checks)' })
  @ApiWrappedResponse(AppInfoDto)
  getInfo() {
    return this.healthService.getInfo();
  }

  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe (no dependency checks)' })
  @ApiWrappedResponse(LivenessStatusDto)
  getLiveness() {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe (checks the database)' })
  @ApiWrappedResponse(ReadinessStatusDto)
  async getReadiness() {
    const readiness = await this.healthService.getReadiness();
    if (readiness.status !== 'ok') {
      throw new ServiceUnavailableException(readiness);
    }
    return readiness;
  }
}
