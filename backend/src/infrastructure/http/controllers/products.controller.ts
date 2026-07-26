import { Controller, Get, Inject } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY_PORT,
  ProductRepositoryPort,
} from '@/domain/ports/ports';

@Controller('api/v1/products')
export class ProductsController {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepo: ProductRepositoryPort,
  ) {}

  @Get()
  async getProducts() {
    const products = await this.productRepo.findAll();
    return { success: true, data: products };
  }
}