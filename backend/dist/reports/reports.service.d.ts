import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSummaryByMonth(contextId: string, month: number, year: number): Promise<{
        period: {
            month: number;
            year: number;
        };
        totalIncome: number;
        totalExpense: number;
        balance: number;
        byCategory: {
            id: string | null;
            name: string;
            icon: string;
            amount: number;
            type: string;
        }[];
    }>;
}
