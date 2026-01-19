import { RecurringExpensesService } from './recurring-expenses.service';
import { Prisma } from '@prisma/client';
export declare class RecurringExpensesController {
    private readonly service;
    constructor(service: RecurringExpensesService);
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
