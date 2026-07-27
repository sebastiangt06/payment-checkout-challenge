import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction} from '@/domain/models/Transaction';
import { TransactionStatus } from '@/domain/models/TransactionStatus';
import { TransactionRepositoryPort } from '../../../domain/ports/ports';
import { TransactionOrmEntity } from './entities/transaction.orm-entity';

@Injectable()
export class PostgresTransactionRepository implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly repository: Repository<TransactionOrmEntity>,
  ) {}

  private toDomain(orm: TransactionOrmEntity): Transaction {
    return new Transaction(
      orm.id,
      orm.reference,
      orm.productId,
      orm.quantity,
      orm.amount,
      orm.baseFee,
      orm.deliveryFee,
      orm.status as TransactionStatus,
      orm.customerData,
      orm.deliveryData,
      orm.createdAt.toISOString(),
    );
  }

  private toOrm(domain: Transaction): TransactionOrmEntity {
    const orm = new TransactionOrmEntity();
    orm.id = domain.id;
    orm.reference = domain.reference;
    orm.productId = domain.productId;
    orm.quantity = domain.quantity;
    orm.amount = domain.amount;
    orm.baseFee = domain.baseFee;
    orm.deliveryFee = domain.deliveryFee;
    orm.status = domain.status;
    orm.customerData = domain.customerData;
    orm.deliveryData = domain.deliveryData;
    return orm;
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const ormEntity = this.toOrm(transaction);
    const saved = await this.repository.save(ormEntity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const ormEntity = this.toOrm(transaction);
    const updated = await this.repository.save(ormEntity);
    return this.toDomain(updated);
  }
}