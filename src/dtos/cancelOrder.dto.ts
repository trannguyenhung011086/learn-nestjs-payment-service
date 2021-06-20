import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CancelOrderDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsBoolean()
  refund: boolean;

  @IsNotEmpty()
  @IsString()
  hash: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
