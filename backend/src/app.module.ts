import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductController } from '@/infrastructure/http/controllers/product.controller';
import { TransactionController } from '@/infrastructure/http/controllers/transaction.controller';
import { CreateTransactionUseCase } from '@/domain/use-cases/create-transaction.use-case';
import { ProcessPaymentUseCase } from '@/domain/use-cases/process-payment.use-case';

// Repositorios en Memoria
import { InMemoryProductRepository } from '@/infrastructure/adapters/in-memory-product.repository';
import { InMemoryTransactionRepository } from '@/infrastructure/adapters/in-memory-transaction.repository';

// Repositorios PostgreSQL
import { PostgresProductRepository } from '@/infrastructure/adapters/postgres/postgres-product.repository';
import { PostgresTransactionRepository } from '@/infrastructure/adapters/postgres/postgres-transaction.repository';
import { ProductOrmEntity } from '@/infrastructure/adapters/postgres/entities/product.orm-entity';
import { TransactionOrmEntity } from '@/infrastructure/adapters/postgres/entities/transaction.orm-entity';

import { PaymentAdapter } from '@/infrastructure/adapters/payment.adapter';
import {
  PRODUCT_REPOSITORY_PORT,
  TRANSACTION_REPOSITORY_PORT,
  PAYMENT_GATEWAY_PORT,
} from './domain/ports/ports';

// 💡 Detectamos la bandera antes de definir el módulo
const isInMemory = process.env.USE_IN_MEMORY === 'true';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }),

    // Carga TypeORM SOLO si NO estamos usando la memoria RAM
    ...(isInMemory
      ? []
      : [
          TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 5432,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            entities: [ProductOrmEntity, TransactionOrmEntity],
            synchronize: true,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
          }),
          TypeOrmModule.forFeature([ProductOrmEntity, TransactionOrmEntity]),
        ]),
  ],
  controllers: [ProductController, TransactionController],
  providers: [
    CreateTransactionUseCase,
    ProcessPaymentUseCase,

    // 💡 Selección dinámica del adaptador según la variable de entorno
    {
      provide: PRODUCT_REPOSITORY_PORT,
      useClass: isInMemory ? InMemoryProductRepository : PostgresProductRepository,
    },
    {
      provide: TRANSACTION_REPOSITORY_PORT,
      useClass: isInMemory ? InMemoryTransactionRepository : PostgresTransactionRepository,
    },
    {
      provide: PAYMENT_GATEWAY_PORT,
      useClass: PaymentAdapter,
    },
  ],
})
export class AppModule {}