import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';

export class ProcessOrderDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  hash: string;

  @IsNotEmpty()
  @IsInt()
  amount: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
