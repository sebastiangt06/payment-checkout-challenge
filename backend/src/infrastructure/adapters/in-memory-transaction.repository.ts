import { Injectable } from '@nestjs/common';
import {Transaction} from '@/domain/models/Transaction';
import { TransactionRepositoryPort } from '@/domain/ports/ports';

@Injectable()
export class InMemoryTransactionRepository implements TransactionRepositoryPort {
  private transactions: Map<string, Transaction> = new Map();

  public async save(transaction: Transaction): Promise<Transaction> {
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  public async findById(id: string): Promise<Transaction | null> {
    return this.transactions.get(id) || null;
  }

  public async update(transaction: Transaction): Promise<Transaction> {
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }
}