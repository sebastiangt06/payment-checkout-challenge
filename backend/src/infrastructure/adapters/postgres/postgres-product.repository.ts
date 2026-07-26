import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '@/domain/models/Product';
import { ProductRepositoryPort } from '../../../domain/ports/ports';
import { ProductOrmEntity } from './entities/product.orm-entity';
import { randomUUID } from 'crypto';

@Injectable()
export class PostgresProductRepository implements ProductRepositoryPort, OnModuleInit {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repository: Repository<ProductOrmEntity>,
  ) {}

  // Sembrado de base de datos automático al iniciar la app
  async onModuleInit(): Promise<void> {
    const count = await this.repository.count();
    if (count === 0) {
      console.log('🌱 Base de datos vacía. Ejecutando sembrado de productos de prueba...');
      const dummyProducts: ProductOrmEntity[] = [
        {
          id: randomUUID(),
          name: 'CF MOTO 450NK Scale Model & Gear',
          description: 'Modelo a escala oficial + Kit de mantenimiento técnico de alta precisión.',
          price: 185000,
          stock: 5,
        },
        {
          id: randomUUID(),
          name: 'Teclado Mecánico RGB Pro',
          description: 'Teclado mecánico switches red ideal para administración de infraestructura.',
          price: 240000,
          stock: 12,
        },
      ];
      await this.repository.save(dummyProducts);
      console.log('✅ Sembrado finalizado con éxito.');
    }
  }

  private toDomain(ormEntity: ProductOrmEntity): Product {
    return new Product(
      ormEntity.id,
      ormEntity.name,
      ormEntity.description,
      ormEntity.price,
      ormEntity.stock,
    );
  }

  async findAll(): Promise<Product[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async decrementStock(productId: string, quantity: number): Promise<boolean> {
    // Operación transaccional segura a nivel SQL
    const result = await this.repository
      .createQueryBuilder()
      .update(ProductOrmEntity)
      .set({ stock: () => `stock - ${quantity}` })
      .where('id = :id AND stock >= :quantity', { id: productId, quantity })
      .execute();

    return (result.affected || 0) > 0;
  }
}