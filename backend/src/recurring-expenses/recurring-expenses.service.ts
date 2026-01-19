import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecurringExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.RecurringExpenseUncheckedCreateInput) {
    return this.prisma.recurringExpense.create({
      data,
    });
  }

  async findAllByContext(contextId: string) {
    return this.prisma.recurringExpense.findMany({
      where: { contextId },
    });
  }
}
