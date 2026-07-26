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

  // Mock de la pasarela exterior para controlar respuestas aprobadas o rechazadas[cite: 2]
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

  const setupPendingTransaction = async (): Promise<Transaction> => {
    const tx = new Transaction(
      'tx-123',
      'REF-TEST',
      'prod-1',
      185000,
      2500,
      10000,
      'PENDING',
      { name: 'Koby', email: 'test@example.com' },
      { address: 'Cra 1 # 2-3', city: 'Bogotá', phone: '3110000000' },
    );
    return await transactionRepo.save(tx);
  };

  it('debe aprobar la transacción y descontar el stock cuando el pago externo es exitoso (Paso 5.3)[cite: 2]', async () => {
    await setupPendingTransaction();
    const initialProduct = await productRepo.findById('prod-1');
    const initialStock = initialProduct!.stock;

    // Simulamos respuesta aprobada por parte del banco / pasarela[cite: 2]
    mockPaymentGateway.createPayment.mockResolvedValue(
      Result.ok({ id: 'external-id', status: 'APPROVED' }),
    );

    const result = await useCase.execute({
      transactionId: 'tx-123',
      cardToken: 'tok_test_1234',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe('APPROVED'); // Estado actualizado en BD[cite: 2]

    // Verificamos que el stock se redujo exactamente en 1 unidad[cite: 2]
    const updatedProduct = await productRepo.findById('prod-1');
    expect(updatedProduct?.stock).toBe(initialStock - 1);
  });

  it('debe cambiar el estado a DECLINED y NO descontar stock si el pago es rechazado[cite: 2]', async () => {
    await setupPendingTransaction();
    const initialProduct = await productRepo.findById('prod-1');
    const initialStock = initialProduct!.stock;

    // Simulamos rechazo por tarjeta sin fondos
    mockPaymentGateway.createPayment.mockResolvedValue(
      Result.fail('Fondos insuficientes'),
    );

    const result = await useCase.execute({
      transactionId: 'tx-123',
      cardToken: 'tok_test_declined',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Fondos insuficientes');

    const txInDb = await transactionRepo.findById('tx-123');
    expect(txInDb?.status).toBe('DECLINED');

    // El inventario debe permanecer intocable
    const productAfter = await productRepo.findById('prod-1');
    expect(productAfter?.stock).toBe(initialStock);
  });

  it('debe rechazar el proceso si la transacción ya no está en estado PENDING', async () => {
    const tx = await setupPendingTransaction();
    tx.status = 'APPROVED'; // Modificamos el estado previamente
    await transactionRepo.update(tx);

    const result = await useCase.execute({
      transactionId: 'tx-123',
      cardToken: 'tok_test_1234',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('La transacción ya fue procesada.');
  });
});