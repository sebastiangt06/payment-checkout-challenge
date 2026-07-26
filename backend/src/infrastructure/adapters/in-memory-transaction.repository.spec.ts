import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from '@/domain/use-cases/create-transaction.use-case';
import { PRODUCT_REPOSITORY_PORT, TRANSACTION_REPOSITORY_PORT } from '@/domain/ports/ports';
import { InMemoryProductRepository } from '@/infrastructure/adapters/in-memory-product.repository';
import { InMemoryTransactionRepository } from '@/infrastructure/adapters/in-memory-transaction.repository';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let productRepo: InMemoryProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        {
          provide: PRODUCT_REPOSITORY_PORT,
          useClass: InMemoryProductRepository,
        },
        {
          provide: TRANSACTION_REPOSITORY_PORT,
          useClass: InMemoryTransactionRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
    productRepo = module.get<InMemoryProductRepository>(PRODUCT_REPOSITORY_PORT);
  });

  const validCommand = {
    productId: 'prod-1',
    customerData: { name: 'Koby Cleves', email: 'koby@example.com' },
    deliveryData: { address: 'Calle Falsa 123', city: 'Cali', phone: '3001234567' },
  };

  it('debe crear una transacción en estado PENDING y agregar la tarifa base fija[cite: 2]', async () => {
    const result = await useCase.execute(validCommand);

    expect(result.isSuccess).toBe(true);
    const transaction = result.getValue();
    expect(transaction.status).toBe('PENDING'); // Paso 5.1[cite: 2]
    expect(transaction.baseFee).toBe(2500); // Tarifa base fija obligatoria[cite: 2]
    expect(transaction.deliveryFee).toBe(10000);
    expect(transaction.reference).toContain('TX-');
  });

  it('debe fallar si el producto no existe en la base de datos', async () => {
    const result = await useCase.execute({
      ...validCommand,
      productId: 'producto-inexistente',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Producto no encontrado.');
  });

  it('debe fallar si el producto se quedó sin stock disponible', async () => {
    // Vaciamos el stock manualmente para la prueba
    await productRepo.decrementStock('prod-1', 5);

    const result = await useCase.execute(validCommand);
    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Producto sin stock disponible.');
  });
});