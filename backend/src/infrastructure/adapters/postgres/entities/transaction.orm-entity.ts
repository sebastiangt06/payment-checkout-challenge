import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('transactions')
export class TransactionOrmEntity {
  @PrimaryColumn('uuid')
  id: string = '';

  @Column({ type: 'varchar', unique: true })
  reference: string = '';

  @Column('uuid')
  productId: string = '';

  @Column({ type: 'int' })
  amount: number = 0;

  @Column({ type: 'int' })
  baseFee: number = 0;

  @Column({ type: 'int' })
  deliveryFee: number   = 0;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: string = '';

  // Utilizamos jsonb en PostgreSQL para almacenar estructuras complejas de forma nativa
  @Column({ type: 'jsonb' })
  customerData: { name: string; email: string } = { name: '', email: '' };

  @Column({ type: 'jsonb' })
  deliveryData: { address: string; city: string; phone: string } = { address: '', city: '', phone: '' };

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date = new Date();
}