import { Injectable, Inject } from '@nestjs/common';
import { Result } from '@/shared/result';
import {Transaction} from '@/domain/models/Transaction';
import {CustomerData} from '@/domain/models/CustomerData';
import {DeliveryData} from '@/domain/models/DeliveryData';
import {
  PRODUCT_REPOSITORY_PORT,
  ProductRepositoryPort,
  TRANSACTION_REPOSITORY_PORT,
  TransactionRepositoryPort,
} from '../ports/ports';
import { randomUUID } from 'crypto';

export interface CreateTransactionCommand {
  productId: string;
  customerData: CustomerData;
  deliveryData: DeliveryData;
}

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepo: ProductRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY_PORT)
    private readonly transactionRepo: TransactionRepositoryPort,
  ) {}

  public async execute(
    command: CreateTransactionCommand,
  ): Promise<Result<Transaction, string>> {
    try {
      const product = await this.productRepo.findById(command.productId);
      if (!product) return Result.fail('Producto no encontrado.');
      if (product.stock <= 0) return Result.fail('Producto sin stock disponible.');

      const baseFee = 2500; // Tarifa base fija obligatoria según reglas[cite: 2]
      const deliveryFee = 10000; // Tarifa de envío[cite: 2]

      const transaction = new Transaction(
        randomUUID(),
        `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        product.id,
        product.price,
        baseFee,
        deliveryFee,
        'PENDING',
        command.customerData,
        command.deliveryData,
      );

      const savedTransaction = await this.transactionRepo.save(transaction);
      return Result.ok(savedTransaction);
    } catch (error: any) {
      return Result.fail(`Error al crear transacción: ${error.message}`);
    }
  }
}