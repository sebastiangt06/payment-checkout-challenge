import { InMemoryProductRepository } from './in-memory-product.repository';

describe('InMemoryProductRepository', () => {
  let repository: InMemoryProductRepository;

  beforeEach(() => {
    repository = new InMemoryProductRepository();
  });

  it('debe inicializar con los productos de prueba sembrados', async () => {
    const products = await repository.findAll();
    expect(products.length).toBeGreaterThanOrEqual(2);
    expect(products[0].id).toBeDefined();
  });

  it('debe encontrar un producto por su ID', async () => {
    const products = await repository.findAll();
    const targetId = products[0].id;

    const product = await repository.findById(targetId);
    expect(product).toBeDefined();
    expect(product?.name).toContain('CF MOTO');
  });

  it('debe descontar stock correctamente cuando hay existencias suficientes', async () => {
    const products = await repository.findAll();
    const targetId = products[0].id;
    const initialStock = products[0].stock;

    const success = await repository.decrementStock(targetId, 1);
    const updatedProduct = await repository.findById(targetId);

    expect(success).toBe(true);
    expect(updatedProduct?.stock).toBe(initialStock - 1);
  });

  it('no debe descontar stock si la cantidad solicitada supera la disponible', async () => {
    const products = await repository.findAll();
    const targetId = products[0].id;

    const success = await repository.decrementStock(targetId, 9999);
    expect(success).toBe(false);
  });
});