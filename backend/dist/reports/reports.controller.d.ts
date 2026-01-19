import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getMonthlySummary(contextId: string, month: string, year: string): Promise<{
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
