import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class ProcessPaymentDto {
  @IsString()
  @IsNotEmpty()
  cardToken: string = '';

  @IsOptional()
  @IsNumber()
  installments?: number;
}