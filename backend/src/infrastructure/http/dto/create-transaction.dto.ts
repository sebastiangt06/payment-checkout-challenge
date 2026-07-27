import {
  IsString,
  IsEmail,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsNumber,
  Min 
} from 'class-validator';
import { Type } from 'class-transformer';

class CustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string = '';

  @IsEmail()
  @IsNotEmpty()
  email: string = '';
}

class DeliveryDto {
  @IsString()
  @IsNotEmpty()
  address: string = '';

  @IsString()
  @IsNotEmpty()
  city: string = '';

  @IsString()
  @IsNotEmpty()
  phone: string = '';
}

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  productId: string = '';

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number = 1; // <--- Agregado para recibir del HTTP request

  @ValidateNested()
  @Type(() => CustomerDto)
  customerData: CustomerDto = new CustomerDto();

  @ValidateNested()
  @Type(() => DeliveryDto)
  deliveryData: DeliveryDto = new DeliveryDto();
}