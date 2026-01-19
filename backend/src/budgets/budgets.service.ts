import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(contextId: string, createBudgetDto: CreateBudgetDto) {
    const { categoryId, month, year, amount } = createBudgetDto;

    return this.prisma.budget.upsert({
      where: {
        contextId_categoryId_month_year: {
          contextId,
          categoryId,
          month,
          year,
        },
      },
      update: {
        amount,
      },
      create: {
        amount,
        month,
        year,
        categoryId,
        contextId,
      },
    });
  }

  findAll(contextId: string, month?: number, year?: number) {
    return this.prisma.budget.findMany({
      where: {
        contextId,
        ...(month && { month }),
        ...(year && { year }),
      },
      include: {
        category: true,
      },
      orderBy: {
        category: { name: 'asc' },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.budget.findUnique({ where: { id } });
  }

  update(id: string, updateBudgetDto: UpdateBudgetDto) {
    return this.prisma.budget.update({
      where: { id },
      data: updateBudgetDto,
    });
  }

  remove(id: string) {
    return this.prisma.budget.delete({ where: { id } });
  }
}
