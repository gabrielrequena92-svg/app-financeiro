import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Category, CategoryType } from '@prisma/client';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category>;
    findAllByContext(contextId: string, type?: CategoryType): Promise<Category[]>;
    findOne(id: string): Promise<Category | null>;
    update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category>;
    remove(id: string): Promise<Category>;
    createDefaults(contextId: string): Promise<void>;
}
