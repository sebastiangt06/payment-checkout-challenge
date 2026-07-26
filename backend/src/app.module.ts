import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductController } from '@/infrastructure/http/controllers/product.controller';
import { TransactionController } from '@/infrastructure/http/controllers/transaction.controller';
import { CreateTransactionUseCase } from '@/domain/use-cases/create-transaction.use-case';
import { ProcessPaymentUseCase } from '@/domain/use-cases/process-payment.use-case';
import { InMemoryProductRepository } from '@/infrastructure/adapters/in-memory-product.repository';
import { InMemoryTransactionRepository } from '@/infrastructure/adapters/in-memory-transaction.repository';
import { PaymentAdapter } from '@/infrastructure/adapters/payment.adapter';

import {
  PRODUCT_REPOSITORY_PORT,
  TRANSACTION_REPOSITORY_PORT,
  PAYMENT_GATEWAY_PORT,
} from './domain/ports/ports';

@Module({
  imports: [HttpModule],
  controllers: [ProductController, TransactionController],
  providers: [
    // Registro de los Casos de Uso
    CreateTransactionUseCase,
    ProcessPaymentUseCase,
    // Enlace Hexagonal: Vinculando Tokens con Adaptadores Reales
    {
      provide: PRODUCT_REPOSITORY_PORT,
      useClass: InMemoryProductRepository,
    },
    {
      provide: TRANSACTION_REPOSITORY_PORT,
      useClass: InMemoryTransactionRepository,
    },
    {
      provide: PAYMENT_GATEWAY_PORT,
      useClass: PaymentAdapter,
    },
  ],
})
export class AppModule {}