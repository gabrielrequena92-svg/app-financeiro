import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Account } from '@prisma/client';
export declare class AccountsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.AccountCreateManyInput): Promise<Account>;
    findAllByContext(contextId: string): Promise<any[]>;
    findOne(id: string): Promise<Account | null>;
    update(id: string, data: Prisma.AccountUpdateInput): Promise<Account>;
    remove(id: string): Promise<Account>;
}
