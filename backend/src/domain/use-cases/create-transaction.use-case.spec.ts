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

  it('debe crear una transacción en estado PENDING con la cantidad por defecto (1) y tarifas fijas', async () => {
    const result = await useCase.execute(validCommand);

    expect(result.isSuccess).toBe(true);
    const transaction = result.getValue();
    const product = await productRepo.findById('prod-1');

    expect(transaction.status).toBe('PENDING');
    expect(transaction.quantity).toBe(1);
    expect(transaction.amount).toBe(product!.price * 1); // Subtotal de 1 unidad
    expect(transaction.baseFee).toBe(2500); // Tarifa base fija obligatoria
    expect(transaction.deliveryFee).toBe(10000);
    expect(transaction.reference).toContain('TX-');
  });

  it('debe calcular correctamente el subtotal cuando se solicitan múltiples unidades', async () => {
    const quantity = 2;
    const result = await useCase.execute({
      ...validCommand,
      quantity,
    });

    expect(result.isSuccess).toBe(true);
    const transaction = result.getValue();
    const product = await productRepo.findById('prod-1');

    expect(transaction.quantity).toBe(2);
    expect(transaction.amount).toBe(product!.price * quantity); // Subtotal multiplicado
  });

  it('debe fallar si el producto no existe en la base de datos', async () => {
    const result = await useCase.execute({
      ...validCommand,
      productId: 'producto-inexistente',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Producto no encontrado.');
  });

  it('debe fallar si la cantidad solicitada supera el stock disponible', async () => {
    const product = await productRepo.findById('prod-1');
    const excessiveQuantity = product!.stock + 10;

    const result = await useCase.execute({
      ...validCommand,
      quantity: excessiveQuantity,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Stock insuficiente');
  });
});