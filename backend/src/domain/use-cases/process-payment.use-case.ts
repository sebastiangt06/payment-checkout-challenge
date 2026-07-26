import { Injectable, Inject } from '@nestjs/common';
import { Result } from '@/shared/result';
import {Transaction } from '@/domain/models/Transaction';

import {
  TRANSACTION_REPOSITORY_PORT,
  TransactionRepositoryPort,
  PRODUCT_REPOSITORY_PORT,
  ProductRepositoryPort,
  PAYMENT_GATEWAY_PORT,
  PaymentGatewayPort,
} from '../ports/ports';

export interface ProcessPaymentCommand {
  transactionId: string;
  cardToken: string;
  installments?: number;
}

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY_PORT)
    private readonly transactionRepo: TransactionRepositoryPort,
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepo: ProductRepositoryPort,
    @Inject(PAYMENT_GATEWAY_PORT)
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  public async execute(
    command: ProcessPaymentCommand,
  ): Promise<Result<Transaction, string>> {
    try {
      const transaction = await this.transactionRepo.findById(
        command.transactionId,
      );
      if (!transaction) return Result.fail('Transacción no encontrada.');
      if (transaction.status !== 'PENDING')
        return Result.fail('La transacción ya fue procesada.');

      const totalAmountInCents =
        (transaction.amount + transaction.baseFee + transaction.deliveryFee) * 100;

      // 1. Llamar a la API externa para procesar el pago (Paso 5.2)[cite: 2]
      const paymentResult = await this.paymentGateway.createPayment({
        amountInCents: totalAmountInCents,
        currency: 'COP',
        customerEmail: transaction.customerData.email,
        reference: transaction.reference,
        cardToken: command.cardToken,
        installments: command.installments || 1,
      });

      if (paymentResult.isFailure) {
        transaction.status = 'DECLINED';
        await this.transactionRepo.update(transaction);
        return Result.fail(paymentResult.error || 'Pago rechazado por el banco.');
      }

      // 2. Si es exitoso, actualizar transacción y stock (Pasos 5.3.1 al 5.3.3)[cite: 2]
      transaction.status = 'APPROVED';
      await this.transactionRepo.update(transaction);
      await this.productRepo.decrementStock(transaction.productId, 1);

      return Result.ok(transaction);
    } catch (error: any) {
      return Result.fail(`Error de procesamiento: ${error.message}`);
    }
  }
}