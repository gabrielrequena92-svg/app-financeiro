import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateBudgetDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsInt()
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  month: number;

  @IsInt()
  @IsNotEmpty()
  year: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
