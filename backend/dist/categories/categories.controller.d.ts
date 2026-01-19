import { CategoriesService } from './categories.service';
import { Prisma, CategoryType } from '@prisma/client';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(data: Prisma.CategoryUncheckedCreateInput): Promise<{
        id: string;
        name: string;
        icon: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        contextId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createDefaults(contextId: string): Promise<void>;
    findAllByContext(contextId: string, type?: CategoryType): Promise<{
        id: string;
        name: string;
        icon: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        contextId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        icon: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        contextId: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    update(id: string, data: Prisma.CategoryUpdateInput): Promise<{
        id: string;
        name: string;
        icon: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        contextId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        icon: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        contextId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
