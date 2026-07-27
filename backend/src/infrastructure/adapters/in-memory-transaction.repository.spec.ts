import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from '@/domain/use-cases/create-transaction.use-case';
import { PRODUCT_REPOSITORY_PORT, TRANSACTION_REPOSITORY_PORT } from '@/domain/ports/ports';
import { InMemoryProductRepository } from '@/infrastructure/adapters/in-memory-product.repository';
import { InMemoryTransactionRepository } from '@/infrastructure/adapters/in-memory-transaction.repository';

describe('InMemoryTransactionRepository Integration', () => {
  let useCase: CreateTransactionUseCase;
  let productRepo: InMemoryProductRepository;
  let testProductId: string;

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

    // Obtenemos un ID aleatorio real de la semilla
    const products = await productRepo.findAll();
    testProductId = products[0].id;
  });

  const getValidCommand = () => ({
    productId: testProductId,
    customerData: { name: 'Koby Cleves', email: 'koby@example.com' },
    deliveryData: { address: 'Calle Falsa 123', city: 'Cali', phone: '3001234567' },
  });

  it('debe crear una transacción en estado PENDING y agregar la tarifa base fija', async () => {
    const result = await useCase.execute(getValidCommand());

    expect(result.isSuccess).toBe(true);
    const transaction = result.getValue();
    expect(transaction.status).toBe('PENDING');
    expect(transaction.baseFee).toBe(2500);
    expect(transaction.deliveryFee).toBe(10000);
    expect(transaction.reference).toContain('TX-');
  });

  it('debe fallar si el producto no existe en la base de datos', async () => {
    const result = await useCase.execute({
      ...getValidCommand(),
      productId: '00000000-0000-0000-0000-000000000000',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Producto no encontrado.');
  });

  it('debe fallar si el producto se quedó sin stock disponible', async () => {
    // Vaciamos el stock del producto dinámico para la prueba
    await productRepo.decrementStock(testProductId, 5);

    const result = await useCase.execute(getValidCommand());
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Stock insuficiente');
  });
});