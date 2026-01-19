import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpException,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ContextsService } from './contexts.service';
import { Context, Prisma } from '@prisma/client';

@Controller('contexts')
export class ContextsController {
  constructor(private readonly contextsService: ContextsService) {}

  @Post(':userId')
  async create(
    @Param('userId') userId: string,
    @Body() data: Prisma.ContextCreateInput,
  ): Promise<Context> {
    return this.contextsService.create(data, userId);
  }

  @Get('user/:userId')
  async findAllByUser(@Param('userId') userId: string): Promise<Context[]> {
    return this.contextsService.findAllByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Context | null> {
    return this.contextsService.findOne(id);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body() body: { email: string; role: string },
    @Headers('x-user-id') requesterId: string,
  ) {
    try {
      return await this.contextsService.addMember(
        id,
        body.email,
        body.role,
        requesterId,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string) {
    return this.contextsService.getMembers(id);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Headers('x-user-id') requesterId: string,
  ) {
    try {
      return await this.contextsService.removeMember(id, userId, requesterId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Prisma.ContextUpdateInput,
  ) {
    return this.contextsService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.contextsService.remove(id);
  }
}
