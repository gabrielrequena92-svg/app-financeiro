import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Context, Prisma } from '@prisma/client';

@Injectable()
export class ContextsService {
  constructor(private prisma: PrismaService) {}

  // Cria um contexto e associa o usuário criador como ADMIN
  async create(
    data: Prisma.ContextCreateInput,
    userId: string,
  ): Promise<Context> {
    return this.prisma.$transaction(async (tx) => {
      const context = await tx.context.create({
        data,
      });

      await tx.contextUser.create({
        data: {
          userId,
          contextId: context.id,
          role: 'ADMIN', // Papel padrão para quem cria
        },
      });

      return context;
    });
  }

  async findOne(id: string): Promise<Context | null> {
    return this.prisma.context.findUnique({
      where: { id },
    });
  }

  async findAllByUser(userId: string): Promise<Context[]> {
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

  async addMember(
    contextId: string,
    email: string,
    role: string,
    requestingUserId: string,
  ) {
    // Check if requester is ADMIN
    const userContext = await this.prisma.contextUser.findUnique({
      where: { userId_contextId: { userId: requestingUserId, contextId } },
    });

    if (!userContext || userContext.role !== 'ADMIN') {
      throw new Error('Forbidden: Only admins can manage members');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found'); // Controller should handle exceptions typically, but simple error here
    }

    // Validate Role
    const validRoles = ['ADMIN', 'COLLABORATOR', 'VIEWER'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role');
    }

    return this.prisma.contextUser.create({
      data: {
        userId: user.id,
        contextId,
        role: role as any,
      },
    });
  }

  async getMembers(contextId: string) {
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

  async removeMember(
    contextId: string,
    userId: string,
    requestingUserId: string,
  ) {
    // Check if requester is ADMIN
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

  async update(id: string, data: Prisma.ContextUpdateInput): Promise<Context> {
    return this.prisma.context.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Context> {
    return this.prisma.$transaction(async (tx) => {
      // Delete dependent data manually since no Cascade in schema
      await tx.transaction.deleteMany({ where: { contextId: id } });
      await tx.recurringExpense.deleteMany({ where: { contextId: id } });
      await tx.budget.deleteMany({ where: { contextId: id } });

      // Accounts and Categories might be referenced by other things?
      // Need to be careful.
      // Accounts
      await tx.account.deleteMany({ where: { contextId: id } });

      // Categories
      await tx.category.deleteMany({ where: { contextId: id } });

      // Members
      await tx.contextUser.deleteMany({ where: { contextId: id } });

      // Finally content
      return tx.context.delete({ where: { id } });
    });
  }
}
