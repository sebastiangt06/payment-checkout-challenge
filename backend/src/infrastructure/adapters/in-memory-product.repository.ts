import { Injectable } from '@nestjs/common';
import {Product} from '@/domain/models/Product';
import { ProductRepositoryPort } from '@/domain/ports/ports';

@Injectable()
export class InMemoryProductRepository implements ProductRepositoryPort {
  private products: Map<string, Product> = new Map();

  constructor() {
    this.seedProducts(); // Sembrado de datos inicial[cite: 2]
  }

  private seedProducts(): void {
    const p1 = new Product(
      'prod-1',
      'CF MOTO 450NK Scale Model & Gear',
      'Modelo a escala oficial + Kit de mantenimiento técnico de alta precisión.',
      185000,
      5,
    );
    const p2 = new Product(
      'prod-2',
      'Teclado Mecánico RGB Pro',
      'Teclado mecánico switches red ideal para administración de servidores.',
      240000,
      12,
    );
    this.products.set(p1.id, p1);
    this.products.set(p2.id, p2);
  }

  public async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  public async findById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  public async decrementStock(
    productId: string,
    quantity: number,
  ): Promise<boolean> {
    const product = this.products.get(productId);
    if (product && product.stock >= quantity) {
      product.stock -= quantity;
      this.products.set(productId, product);
      return true;
    }
    return false;
  }
}