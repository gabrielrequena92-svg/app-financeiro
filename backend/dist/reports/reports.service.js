"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummaryByMonth(contextId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const transactions = await this.prisma.transaction.findMany({
            where: {
                contextId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
                isPaid: true,
            },
            include: {
                category: true,
            },
        });
        let totalIncome = 0;
        let totalExpense = 0;
        const categoryMap = new Map();
        for (const tx of transactions) {
            const amount = Number(tx.amount);
            if (tx.type === 'INCOME') {
                totalIncome += amount;
            }
            else if (tx.type === 'EXPENSE') {
                totalExpense += amount;
            }
            if (tx.categoryId && tx.category) {
                const catId = tx.categoryId;
                if (!categoryMap.has(catId)) {
                    categoryMap.set(catId, {
                        id: catId,
                        name: tx.category.name,
                        icon: tx.category.icon || '',
                        amount: 0,
                        type: tx.category.type,
                    });
                }
                const current = categoryMap.get(catId);
                current.amount += amount;
            }
            else {
                const unknownKey = `unknown_${tx.type}`;
                if (!categoryMap.has(unknownKey)) {
                    categoryMap.set(unknownKey, {
                        id: null,
                        name: 'Sem Categoria',
                        icon: '❓',
                        amount: 0,
                        type: tx.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
                    });
                }
                const current = categoryMap.get(unknownKey);
                current.amount += amount;
            }
        }
        const byCategory = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);
        return {
            period: { month, year },
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            byCategory,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map