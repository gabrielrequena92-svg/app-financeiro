import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Transaction } from '@prisma/client';
export declare class TransactionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.TransactionUncheckedCreateInput & {
        installments?: number;
    }): Promise<Transaction | Transaction[]>;
    findAllByContext(contextId: string): Promise<Transaction[]>;
    findAllByAccount(accountId: string): Promise<Transaction[]>;
    findOne(id: string): Promise<Transaction | null>;
    markAsPaid(id: string, paymentDate: Date): Promise<Transaction>;
}
