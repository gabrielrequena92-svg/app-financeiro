import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class RecurringExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.RecurringExpenseUncheckedCreateInput): Promise<{
        id: string;
        description: string;
        amount: Prisma.Decimal | null;
        type: import("@prisma/client").$Enums.RecurrenceType;
        dayOfMonth: number;
        notificationDaysBefore: number | null;
        active: boolean;
        contextId: string;
        categoryId: string | null;
        sourceAccountId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAllByContext(contextId: string): Promise<{
        id: string;
        description: string;
        amount: Prisma.Decimal | null;
        type: import("@prisma/client").$Enums.RecurrenceType;
        dayOfMonth: number;
        notificationDaysBefore: number | null;
        active: boolean;
        contextId: string;
        categoryId: string | null;
        sourceAccountId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
