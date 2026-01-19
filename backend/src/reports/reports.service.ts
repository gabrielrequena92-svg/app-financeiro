import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummaryByMonth(contextId: string, month: number, year: number) {
    // Datas de início e fim do mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59); // Fim do mês atual

    const transactions = await this.prisma.transaction.findMany({
      where: {
        contextId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        isPaid: true, // Considerar apenas realizados para relatórios de fluxo
      },
      include: {
        category: true,
      },
    });

    // Agregação
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = new Map<
      string,
      {
        id: string | null;
        name: string;
        icon: string;
        amount: number;
        type: string;
      }
    >();

    for (const tx of transactions) {
      const amount = Number(tx.amount);

      if (tx.type === 'INCOME') {
        totalIncome += amount;
      } else if (tx.type === 'EXPENSE') {
        totalExpense += amount;
      }

      // Agrupar por categoria
      if (tx.categoryId && tx.category) {
        const catId = tx.categoryId;
        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, {
            id: catId,
            name: tx.category.name,
            icon: tx.category.icon || '',
            amount: 0,
            type: tx.category.type,
          });
        }
        const current = categoryMap.get(catId)!;
        current.amount += amount;
      } else {
        // Sem Categoria
        const unknownKey = `unknown_${tx.type}`;
        if (!categoryMap.has(unknownKey)) {
          categoryMap.set(unknownKey, {
            id: null,
            name: 'Sem Categoria',
            icon: '❓',
            amount: 0,
            type: tx.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
          });
        }
        const current = categoryMap.get(unknownKey)!;
        current.amount += amount;
      }
    }

    const byCategory = Array.from(categoryMap.values()).sort(
      (a, b) => b.amount - a.amount,
    );

    return {
      period: { month, year },
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byCategory,
    };
  }
}
