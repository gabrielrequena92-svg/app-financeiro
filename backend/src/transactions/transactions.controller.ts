import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Prisma } from '@prisma/client';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() data: Prisma.TransactionUncheckedCreateInput) {
    return this.transactionsService.create(data);
  }

  @Get('context/:contextId')
  findAllByContext(@Param('contextId') contextId: string) {
    return this.transactionsService.findAllByContext(contextId);
  }

  @Get('account/:accountId')
  findAllByAccount(@Param('accountId') accountId: string) {
    return this.transactionsService.findAllByAccount(accountId);
  }

  @Patch(':id/pay')
  markAsPaid(@Param('id') id: string, @Body('date') date: string) {
    return this.transactionsService.markAsPaid(id, new Date(date));
  }
}
