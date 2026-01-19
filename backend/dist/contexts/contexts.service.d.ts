import { PrismaService } from '../prisma/prisma.service';
import { Context, Prisma } from '@prisma/client';
export declare class ContextsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.ContextCreateInput, userId: string): Promise<Context>;
    findOne(id: string): Promise<Context | null>;
    findAllByUser(userId: string): Promise<Context[]>;
    addMember(contextId: string, email: string, role: string, requestingUserId: string): Promise<{
        id: string;
        userId: string;
        contextId: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
    getMembers(contextId: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        userId: string;
        contextId: string;
        role: import("@prisma/client").$Enums.Role;
    })[]>;
    removeMember(contextId: string, userId: string, requestingUserId: string): Promise<{
        id: string;
        userId: string;
        contextId: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
    update(id: string, data: Prisma.ContextUpdateInput): Promise<Context>;
    remove(id: string): Promise<Context>;
}
