import { Test, TestingModule } from '@nestjs/testing';
import { ProcessPaymentUseCase } from './process-payment.use-case';
import {
  PRODUCT_REPOSITORY_PORT,
  TRANSACTION_REPOSITORY_PORT,
  PAYMENT_GATEWAY_PORT,
} from '../ports/ports';
import { InMemoryProductRepository } from '@/infrastructure/adapters/in-memory-product.repository';
import { InMemoryTransactionRepository } from '@/infrastructure/adapters/in-memory-transaction.repository';
import { Result } from '../../shared/result';
import { Transaction } from '@/domain/models/Transaction';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let transactionRepo: InMemoryTransactionRepository;
  let productRepo: InMemoryProductRepository;

  const mockPaymentGateway = {
    createPayment: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPaymentUseCase,
        { provide: PRODUCT_REPOSITORY_PORT, useClass: InMemoryProductRepository },
        { provide: TRANSACTION_REPOSITORY_PORT, useClass: InMemoryTransactionRepository },
        { provide: PAYMENT_GATEWAY_PORT, useValue: mockPaymentGateway },
      ],
    }).compile();

    useCase = module.get<ProcessPaymentUseCase>(ProcessPaymentUseCase);
    transactionRepo = module.get<InMemoryTransactionRepository>(TRANSACTION_REPOSITORY_PORT);
    productRepo = module.get<InMemoryProductRepository>(PRODUCT_REPOSITORY_PORT);
  });

  const setupPendingTransaction = async (quantity = 1): Promise<{ tx: Transaction; productId: string }> => {
    const products = await productRepo.findAll();
    const product = products[0];
    const tx = new Transaction(
      'tx-123',
      'REF-TEST',
      product.id,
      quantity,
      product.price * quantity,
      2500,
      10000,
      'PENDING',
      { name: 'Koby', email: 'test@example.com' },
      { address: 'Cra 1 # 2-3', city: 'Bogotá', phone: '3110000000' },
    );
    const savedTx = await transactionRepo.save(tx);
    return { tx: savedTx, productId: product.id };
  };

  it('debe aprobar la transacción y descontar la cantidad exacta de stock cuando el pago es exitoso', async () => {
    const purchasedQuantity = 2;
    const { productId } = await setupPendingTransaction(purchasedQuantity);
    
    const initialProduct = await productRepo.findById(productId);
    const initialStock = initialProduct!.stock;

    mockPaymentGateway.createPayment.mockResolvedValue(
      Result.ok({ id: 'external-id', status: 'APPROVED' }),
    );

    const result = await useCase.execute({
      transactionId: 'tx-123',
      cardToken: 'tok_test_1234',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe('APPROVED');

    const updatedProduct = await productRepo.findById(productId);
    expect(updatedProduct?.stock).toBe(initialStock - purchasedQuantity);
  });

  it('debe cambiar el estado a DECLINED y NO descontar stock si el pago es rechazado por la pasarela', async () => {
    const { productId } = await setupPendingTransaction(1);
    const initialProduct = await productRepo.findById(productId);
    const initialStock = initialProduct!.stock;

    mockPaymentGateway.createPayment.mockResolvedValue(
      Result.fail('Fondos insuficientes'),
    );

    const result = await useCase.execute({
      transactionId: 'tx-123',
      cardToken: 'tok_test_declined',
    });

    expect(result.isFailure).toBe(true);

    const txInDb = await transactionRepo.findById('tx-123');
    expect(txInDb?.status).toBe('DECLINED');

    const productAfter = await productRepo.findById(productId);
    expect(productAfter?.stock).toBe(initialStock);
  });

  it('debe rechazar el proceso si la transacción ya no está en estado PENDING', async () => {
    const { tx } = await setupPendingTransaction(1);
    tx.status = 'APPROVED';
    await transactionRepo.update(tx);

    const result = await useCase.execute({
      transactionId: 'tx-123',
      cardToken: 'tok_test_1234',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('La transacción ya fue procesada.');
  });
});