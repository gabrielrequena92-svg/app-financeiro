import { CreateBudgetDto } from './create-budget.dto';

export class UpdateBudgetDto {
  amount?: number;
  month?: number;
  year?: number;
  categoryId?: string;
}
