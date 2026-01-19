import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Transaction } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: Prisma.TransactionUncheckedCreateInput & { installments?: number },
  ): Promise<Transaction | Transaction[]> {
    const installments = data.installments || 1;

    if (installments > 1) {
      const amountPerInstallment = Number(data.amount) / installments;

      // Remove installments from data to avoid type issues or passing it to Prisma
      const { installments: _removed, ...txData } = data;

      const transactions: Prisma.TransactionUncheckedCreateInput[] = [];
      const baseDate = new Date(data.date);
      const baseDueDate = data.dueDate ? new Date(data.dueDate) : null;

      for (let i = 0; i < installments; i++) {
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + i);

        const dueDate = baseDueDate ? new Date(baseDueDate) : null;
        if (dueDate) dueDate.setMonth(dueDate.getMonth() + i);

        transactions.push({
          ...txData,
          amount: amountPerInstallment,
          description: `${txData.description} (${i + 1}/${installments})`,
          installmentNumber: i + 1,
          installmentsTotal: installments,
          date: date,
          dueDate: dueDate,
          isPaid: i === 0 ? txData.isPaid : false, // Only first one might be paid immediately
        });
      }

      return this.prisma.$transaction(
        transactions.map((tx) => this.prisma.transaction.create({ data: tx })),
      );
    }

    return this.prisma.transaction.create({
      data,
    });
  }

  async findAllByContext(contextId: string): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { contextId },
      orderBy: { date: 'desc' },
      include: {
        sourceAccount: { select: { name: true } },
        destinationAccount: { select: { name: true } },
        category: { select: { name: true, icon: true } }, // Include category details
      },
    });
  }

  async findAllByAccount(accountId: string): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { sourceAccountId: accountId },
          { destinationAccountId: accountId },
        ],
      },
      orderBy: { date: 'desc' },
      include: {
        sourceAccount: { select: { name: true } },
        destinationAccount: { select: { name: true } },
        category: { select: { name: true, icon: true } },
      },
    });
  }

  async findOne(id: string): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({
      where: { id },
    });
  }

  // Dar baixa em um agendamento
  async markAsPaid(id: string, paymentDate: Date): Promise<Transaction> {
    return this.prisma.transaction.update({
      where: { id },
      data: {
        isPaid: true,
        paymentDate: paymentDate,
        // Ao efetivar, a data principal passa a ser a data do pagamento para fins de ordenação
        date: paymentDate,
      },
    });
  }
}
