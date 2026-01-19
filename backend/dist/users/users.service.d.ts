import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.UserCreateInput): Promise<User>;
    findOne(where: Prisma.UserWhereUniqueInput): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
}
