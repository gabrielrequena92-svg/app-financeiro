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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TransactionsService = class TransactionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const installments = data.installments || 1;
        if (installments > 1) {
            const amountPerInstallment = Number(data.amount) / installments;
            const { installments: _removed, ...txData } = data;
            const transactions = [];
            const baseDate = new Date(data.date);
            const baseDueDate = data.dueDate ? new Date(data.dueDate) : null;
            for (let i = 0; i < installments; i++) {
                const date = new Date(baseDate);
                date.setMonth(date.getMonth() + i);
                const dueDate = baseDueDate ? new Date(baseDueDate) : null;
                if (dueDate)
                    dueDate.setMonth(dueDate.getMonth() + i);
                transactions.push({
                    ...txData,
                    amount: amountPerInstallment,
                    description: `${txData.description} (${i + 1}/${installments})`,
                    installmentNumber: i + 1,
                    installmentsTotal: installments,
                    date: date,
                    dueDate: dueDate,
                    isPaid: i === 0 ? txData.isPaid : false,
                });
            }
            return this.prisma.$transaction(transactions.map((tx) => this.prisma.transaction.create({ data: tx })));
        }
        return this.prisma.transaction.create({
            data,
        });
    }
    async findAllByContext(contextId) {
        return this.prisma.transaction.findMany({
            where: { contextId },
            orderBy: { date: 'desc' },
            include: {
                sourceAccount: { select: { name: true } },
                destinationAccount: { select: { name: true } },
                category: { select: { name: true, icon: true } },
            },
        });
    }
    async findAllByAccount(accountId) {
        return this.prisma.transaction.findMany({
            where: {
                OR: [
                    { sourceAccountId: accountId },
                    { destinationAccountId: accountId },
                ],
            },
            orderBy: { date: 'desc' },
            include: {
                sourceAccount: { select: { name: true } },
                destinationAccount: { select: { name: true } },
                category: { select: { name: true, icon: true } },
            },
        });
    }
    async findOne(id) {
        return this.prisma.transaction.findUnique({
            where: { id },
        });
    }
    async markAsPaid(id, paymentDate) {
        return this.prisma.transaction.update({
            where: { id },
            data: {
                isPaid: true,
                paymentDate: paymentDate,
                date: paymentDate,
            },
        });
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map