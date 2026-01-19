import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly/:contextId')
  getMonthlySummary(
    @Param('contextId') contextId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    // Default current date if not provided
    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year ? parseInt(year) : new Date().getFullYear();

    return this.reportsService.getSummaryByMonth(contextId, m, y);
  }
}
