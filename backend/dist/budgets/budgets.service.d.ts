import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
export declare class BudgetsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(contextId: string, createBudgetDto: CreateBudgetDto): Promise<{
        id: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        month: number;
        year: number;
        categoryId: string;
        contextId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(contextId: string, month?: number, year?: number): import(".prisma/client").Prisma.PrismaPromise<({
        category: {
            id: string;
            name: string;
            icon: string | null;
            type: import(".prisma/client").$Enums.CategoryType;
            contextId: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        month: number;
        year: number;
        categoryId: string;
        contextId: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__BudgetClient<{
        id: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        month: number;
        year: number;
        categoryId: string;
        contextId: string;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateBudgetDto: UpdateBudgetDto): import(".prisma/client").Prisma.Prisma__BudgetClient<{
        id: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        month: number;
        year: number;
        categoryId: string;
        contextId: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__BudgetClient<{
        id: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        month: number;
        year: number;
        categoryId: string;
        contextId: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
