import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Prisma, CategoryType } from '@prisma/client';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() data: Prisma.CategoryUncheckedCreateInput) {
    return this.categoriesService.create(data);
  }

  @Post('defaults/:contextId')
  createDefaults(@Param('contextId') contextId: string) {
    return this.categoriesService.createDefaults(contextId);
  }

  @Get('context/:contextId')
  findAllByContext(
    @Param('contextId') contextId: string,
    @Query('type') type?: CategoryType,
  ) {
    return this.categoriesService.findAllByContext(contextId, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.CategoryUpdateInput) {
    return this.categoriesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
