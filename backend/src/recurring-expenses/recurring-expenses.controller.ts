import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RecurringExpensesService } from './recurring-expenses.service';
import { Prisma } from '@prisma/client';

@Controller('recurring-expenses')
export class RecurringExpensesController {
  constructor(private readonly service: RecurringExpensesService) {}

  @Post()
  create(@Body() data: Prisma.RecurringExpenseUncheckedCreateInput) {
    return this.service.create(data);
  }

  @Get('context/:contextId')
  findAllByContext(@Param('contextId') contextId: string) {
    return this.service.findAllByContext(contextId);
  }
}
