import {Product} from '../models/Product';
import {Transaction} from '../models/Transaction';
import { Result } from '../../shared/result';

// Tokens para Inyección de Dependencias en NestJS
export const PRODUCT_REPOSITORY_PORT = Symbol('PRODUCT_REPOSITORY_PORT');
export const TRANSACTION_REPOSITORY_PORT = Symbol('TRANSACTION_REPOSITORY_PORT');
export const PAYMENT_GATEWAY_PORT = Symbol('PAYMENT_GATEWAY_PORT');

export abstract class ProductRepositoryPort {
  abstract findAll(): Promise<Product[]>;
  abstract findById(id: string): Promise<Product | null>;
  abstract decrementStock(productId: string, quantity: number): Promise<boolean>;
}

export abstract class TransactionRepositoryPort {
  abstract save(transaction: Transaction): Promise<Transaction>;
  abstract findById(id: string): Promise<Transaction | null>;
  abstract update(transaction: Transaction): Promise<Transaction>;
}

export abstract class PaymentGatewayPort {
  abstract createPayment(params: {
    amountInCents: number;
    currency: string;
    customerEmail: string;
    reference: string;
    cardToken: string;
    installments?: number;
  }): Promise<Result<any, string>>;
}