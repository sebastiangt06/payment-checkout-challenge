import {
  IsString,
  IsEmail,
  IsNotEmpty,
  ValidateNested,
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

  @ValidateNested()
  @Type(() => CustomerDto)
  customerData: CustomerDto = new CustomerDto();

  @ValidateNested()
  @Type(() => DeliveryDto)
  deliveryData: DeliveryDto = new DeliveryDto();
}