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
exports.ContextsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ContextsService = class ContextsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, userId) {
        return this.prisma.$transaction(async (tx) => {
            const context = await tx.context.create({
                data,
            });
            await tx.contextUser.create({
                data: {
                    userId,
                    contextId: context.id,
                    role: 'ADMIN',
                },
            });
            return context;
        });
    }
    async findOne(id) {
        return this.prisma.context.findUnique({
            where: { id },
        });
    }
    async findAllByUser(userId) {
        return this.prisma.context.findMany({
            where: {
                users: {
                    some: {
                        userId,
                    },
                },
            },
        });
    }
    async addMember(contextId, email, role, requestingUserId) {
        const userContext = await this.prisma.contextUser.findUnique({
            where: { userId_contextId: { userId: requestingUserId, contextId } },
        });
        if (!userContext || userContext.role !== 'ADMIN') {
            throw new Error('Forbidden: Only admins can manage members');
        }
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('User not found');
        }
        const validRoles = ['ADMIN', 'COLLABORATOR', 'VIEWER'];
        if (!validRoles.includes(role)) {
            throw new Error('Invalid role');
        }
        return this.prisma.contextUser.create({
            data: {
                userId: user.id,
                contextId,
                role: role,
            },
        });
    }
    async getMembers(contextId) {
        return this.prisma.contextUser.findMany({
            where: { contextId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async removeMember(contextId, userId, requestingUserId) {
        const userContext = await this.prisma.contextUser.findUnique({
            where: { userId_contextId: { userId: requestingUserId, contextId } },
        });
        if (!userContext || userContext.role !== 'ADMIN') {
            throw new Error('Forbidden: Only admins can manage members');
        }
        return this.prisma.contextUser.delete({
            where: {
                userId_contextId: {
                    userId,
                    contextId,
                },
            },
        });
    }
    async update(id, data) {
        return this.prisma.context.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return this.prisma.$transaction(async (tx) => {
            await tx.transaction.deleteMany({ where: { contextId: id } });
            await tx.recurringExpense.deleteMany({ where: { contextId: id } });
            await tx.budget.deleteMany({ where: { contextId: id } });
            await tx.account.deleteMany({ where: { contextId: id } });
            await tx.category.deleteMany({ where: { contextId: id } });
            await tx.contextUser.deleteMany({ where: { contextId: id } });
            return tx.context.delete({ where: { id } });
        });
    }
};
exports.ContextsService = ContextsService;
exports.ContextsService = ContextsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContextsService);
//# sourceMappingURL=contexts.service.js.map