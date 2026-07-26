import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('products')
export class ProductOrmEntity {
  @PrimaryColumn('uuid')
  id: string = '';

  @Column({ type: 'varchar', length: 255 })
  name: string = '';

  @Column({ type: 'text' })
  description: string = '';

  @Column({ type: 'int' })
  price: number = 0;

  @Column({ type: 'int' })
  stock: number = 0;
}