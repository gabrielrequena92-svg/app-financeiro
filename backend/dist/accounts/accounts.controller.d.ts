import { AccountsService } from './accounts.service';
import { Prisma } from '@prisma/client';
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    create(data: Prisma.AccountCreateManyInput): Promise<{
        id: string;
        name: string;
        type: import("@prisma/client").$Enums.AccountType;
        initialBalance: Prisma.Decimal;
        archived: boolean;
        contextId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAllByContext(contextId: string): Promise<any[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        type: import("@prisma/client").$Enums.AccountType;
        initialBalance: Prisma.Decimal;
        archived: boolean;
        contextId: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    update(id: string, data: Prisma.AccountUpdateInput): Promise<{
        id: string;
        name: string;
        type: import("@prisma/client").$Enums.AccountType;
        initialBalance: Prisma.Decimal;
        archived: boolean;
        contextId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        type: import("@prisma/client").$Enums.AccountType;
        initialBalance: Prisma.Decimal;
        archived: boolean;
        contextId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
