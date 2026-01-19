import { ContextsService } from './contexts.service';
import { Context, Prisma } from '@prisma/client';
export declare class ContextsController {
    private readonly contextsService;
    constructor(contextsService: ContextsService);
    create(userId: string, data: Prisma.ContextCreateInput): Promise<Context>;
    findAllByUser(userId: string): Promise<Context[]>;
    findOne(id: string): Promise<Context | null>;
    addMember(id: string, body: {
        email: string;
        role: string;
    }, requesterId: string): Promise<{
        id: string;
        userId: string;
        contextId: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
    getMembers(id: string): Promise<({
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
    removeMember(id: string, userId: string, requesterId: string): Promise<{
        id: string;
        userId: string;
        contextId: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
    update(id: string, data: Prisma.ContextUpdateInput): Promise<{
        id: string;
        name: string;
        type: import("@prisma/client").$Enums.ContextType;
        features: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        type: import("@prisma/client").$Enums.ContextType;
        features: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
}
