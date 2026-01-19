import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Category, CategoryType } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
    return this.prisma.category.create({
      data,
    });
  }

  async findAllByContext(
    contextId: string,
    type?: CategoryType,
  ): Promise<Category[]> {
    const where: Prisma.CategoryWhereInput = { contextId };
    if (type) {
      where.type = type;
    }

    return this.prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.CategoryUpdateInput,
  ): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Category> {
    return this.prisma.category.delete({
      where: { id },
    });
  }

  // Método auxiliar para inicializar categorias padrão
  async createDefaults(contextId: string) {
    const defaults = [
      { name: 'Alimentação', type: 'EXPENSE', icon: '🛒' },
      { name: 'Moradia', type: 'EXPENSE', icon: '🏠' },
      { name: 'Transporte', type: 'EXPENSE', icon: '🚗' },
      { name: 'Lazer', type: 'EXPENSE', icon: '🎉' },
      { name: 'Saúde', type: 'EXPENSE', icon: '🏥' },
      { name: 'Salário', type: 'INCOME', icon: '💼' },
      { name: 'Outros', type: 'EXPENSE', icon: '📦' },
      { name: 'FIIs', type: 'INVESTMENT', icon: '🏢' },
      { name: 'Ações', type: 'INVESTMENT', icon: '📈' },
      { name: 'Criptomoedas', type: 'INVESTMENT', icon: '₿' },
      { name: 'Renda Fixa', type: 'INVESTMENT', icon: '💰' },
      { name: 'Tesouro Direto', type: 'INVESTMENT', icon: '🏛️' },
      { name: 'Stocks', type: 'INVESTMENT', icon: '🇺🇸' },
      { name: 'ETFs', type: 'INVESTMENT', icon: '📊' },
    ] as const;

    for (const cat of defaults) {
      // createMany não é suportado no SQLite se houvesse unique constraint conflict ignoring facilmente,
      // mas como estamos no Postgres podemos usar createMany ou loop com create.
      // Vamos de loop simples para garantir.
      const exists = await this.prisma.category.findFirst({
        where: { contextId, name: cat.name, type: cat.type },
      });

      if (!exists) {
        await this.prisma.category.create({
          data: {
            ...cat,
            contextId,
          },
        });
      }
    }
  }
}
