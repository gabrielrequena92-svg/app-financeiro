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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.category.create({
            data,
        });
    }
    async findAllByContext(contextId, type) {
        const where = { contextId };
        if (type) {
            where.type = type;
        }
        return this.prisma.category.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        return this.prisma.category.findUnique({
            where: { id },
        });
    }
    async update(id, data) {
        return this.prisma.category.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return this.prisma.category.delete({
            where: { id },
        });
    }
    async createDefaults(contextId) {
        const defaults = [
            { name: 'Alimentação', type: 'EXPENSE', icon: '🛒' },
            { name: 'Moradia', type: 'EXPENSE', icon: '🏠' },
            { name: 'Transporte', type: 'EXPENSE', icon: '🚗' },
            { name: 'Lazer', type: 'EXPENSE', icon: '🎉' },
            { name: 'Saúde', type: 'EXPENSE', icon: '🏥' },
            { name: 'Salário', type: 'INCOME', icon: '💼' },
            { name: 'Outros', type: 'EXPENSE', icon: '📦' },
            { name: 'FIIs', type: 'INVESTMENT', icon: '🏢' },
            { name: 'Ações', type: 'INVESTMENT', icon: '📈' },
            { name: 'Criptomoedas', type: 'INVESTMENT', icon: '₿' },
            { name: 'Renda Fixa', type: 'INVESTMENT', icon: '💰' },
            { name: 'Tesouro Direto', type: 'INVESTMENT', icon: '🏛️' },
            { name: 'Stocks', type: 'INVESTMENT', icon: '🇺🇸' },
            { name: 'ETFs', type: 'INVESTMENT', icon: '📊' },
        ];
        for (const cat of defaults) {
            const exists = await this.prisma.category.findFirst({
                where: { contextId, name: cat.name, type: cat.type },
            });
            if (!exists) {
                await this.prisma.category.create({
                    data: {
                        ...cat,
                        contextId,
                    },
                });
            }
        }
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map