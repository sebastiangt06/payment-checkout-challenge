import {Product} from '../models/Product';
import {Transaction} from '../models/Transaction';
import { Result } from '../../shared/result';

// Tokens para Inyección de Dependencias en NestJS
export const PRODUCT_REPOSITORY_PORT = Symbol('PRODUCT_REPOSITORY_PORT');
export const TRANSACTION_REPOSITORY_PORT = Symbol('TRANSACTION_REPOSITORY_PORT');
export const PAYMENT_GATEWAY_PORT = Symbol('PAYMENT_GATEWAY_PORT');

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  decrementStock(productId: string, quantity: number): Promise<boolean>;
}

export interface TransactionRepositoryPort {
  save(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  update(transaction: Transaction): Promise<Transaction>;
}

export interface PaymentGatewayPort {
  createPayment(params: {
    amountInCents: number;
    currency: string;
    customerEmail: string;
    reference: string;
    cardToken: string;
    installments?: number;
  }): Promise<Result<any, string>>;
}