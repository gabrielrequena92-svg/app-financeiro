import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
interface LoginDto {
    email: string;
    password: string;
}
interface RegisterDto {
    name: string;
    email: string;
    password: string;
}
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            name: any;
            email: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: any;
            name: any;
            email: any;
        };
    }>;
}
export {};
