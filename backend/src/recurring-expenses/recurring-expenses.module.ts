import { Module } from '@nestjs/common';
import { RecurringExpensesService } from './recurring-expenses.service';
import { RecurringExpensesController } from './recurring-expenses.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RecurringExpensesController],
  providers: [RecurringExpensesService, PrismaService],
})
export class RecurringExpensesModule {}
