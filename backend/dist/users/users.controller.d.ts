import { UsersService } from './users.service';
import { User } from '@prisma/client';
interface CreateUserDto {
    name: string;
    email: string;
    password: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(userData: CreateUserDto): Promise<User>;
    findOne(email: string): Promise<User | null>;
}
export {};
