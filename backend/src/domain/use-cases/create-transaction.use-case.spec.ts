import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from '@/domain/use-cases/create-transaction.use-case';
import { PRODUCT_REPOSITORY_PORT, TRANSACTION_REPOSITORY_PORT } from '@/domain/ports/ports';
import { InMemoryProductRepository } from '@/infrastructure/adapters/in-memory-product.repository';
import { InMemoryTransactionRepository } from '@/infrastructure/adapters/in-memory-transaction.repository';

describe('CreateTransactionUseCase', () => {
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

    // Obtenemos un ID aleatorio válido para usar en los comandos de prueba
    const products = await productRepo.findAll();
    testProductId = products[0].id;
  });

  const getValidCommand = () => ({
    productId: testProductId,
    customerData: { name: 'Koby Cleves', email: 'koby@example.com' },
    deliveryData: { address: 'Calle Falsa 123', city: 'Cali', phone: '3001234567' },
  });

  it('debe crear una transacción en estado PENDING con la cantidad por defecto (1)', async () => {
    const result = await useCase.execute(getValidCommand());

    expect(result.isSuccess).toBe(true);
    const transaction = result.getValue();
    const product = await productRepo.findById(testProductId);

    expect(transaction.status).toBe('PENDING');
    expect(transaction.quantity).toBe(1);
    expect(transaction.amount).toBe(product!.price * 1);
    expect(transaction.baseFee).toBe(2500);
    expect(transaction.deliveryFee).toBe(10000);
  });

  it('debe calcular correctamente el subtotal cuando se solicitan múltiples unidades', async () => {
    const quantity = 2;
    const result = await useCase.execute({
      ...getValidCommand(),
      quantity,
    });

    expect(result.isSuccess).toBe(true);
    const transaction = result.getValue();
    const product = await productRepo.findById(testProductId);

    expect(transaction.quantity).toBe(2);
    expect(transaction.amount).toBe(product!.price * quantity);
  });

  it('debe fallar si el producto no existe en la base de datos', async () => {
    const result = await useCase.execute({
      ...getValidCommand(),
      productId: '00000000-0000-0000-0000-000000000000',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Producto no encontrado.');
  });

  it('debe fallar si la cantidad solicitada supera el stock disponible', async () => {
    const product = await productRepo.findById(testProductId);
    const excessiveQuantity = product!.stock + 10;

    const result = await useCase.execute({
      ...getValidCommand(),
      quantity: excessiveQuantity,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Stock insuficiente');
  });
});