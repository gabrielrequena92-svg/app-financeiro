import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';

interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(
    @Body() userData: CreateUserDto,
  ): Promise<User> {
    return this.usersService.create(userData);
  }

  @Get(':email')
  async findOne(@Param('email') email: string): Promise<User | null> {
    return this.usersService.findOne({ email });
  }
}
