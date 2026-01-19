import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Account } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.AccountCreateManyInput): Promise<Account> {
    return this.prisma.account.create({
      data,
    });
  }

  // Agora retorna Account & { currentBalance: number }
  async findAllByContext(contextId: string): Promise<any[]> {
    const accounts = await this.prisma.account.findMany({
      where: { contextId, archived: false },
      include: {
        // Filtrar Apenas Transações Pagas (isPaid: true) para o Saldo Atual
        transactionsFrom: {
          where: { isPaid: true },
          select: { amount: true, type: true },
        },
        transactionsTo: {
          where: { isPaid: true },
          select: { amount: true, type: true },
        },
      },
    });

    return accounts.map((acc) => {
      // Cálculo do Saldo
      // 1. Começa com saldo inicial
      let balance = Number(acc.initialBalance);

      // 2. Subtrai saídas (SourceAccount)
      acc.transactionsFrom.forEach((tx) => {
        balance -= Number(tx.amount);
      });

      // 3. Adiciona entradas (DestinationAccount)
      acc.transactionsTo.forEach((tx) => {
        balance += Number(tx.amount);
      });

      // Limpar os arrays de transactions para não poluir o retorno
      const { transactionsFrom, transactionsTo, ...accountData } = acc;
      return {
        ...accountData,
        currentBalance: balance,
      };
    });
  }

  async findOne(id: string): Promise<Account | null> {
    return this.prisma.account.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.AccountUpdateInput): Promise<Account> {
    return this.prisma.account.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Account> {
    // Soft delete (archive)
    return this.prisma.account.update({
      where: { id },
      data: { archived: true },
    });
  }
}
