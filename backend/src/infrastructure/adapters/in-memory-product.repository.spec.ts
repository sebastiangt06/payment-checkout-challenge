import { InMemoryProductRepository } from './in-memory-product.repository';

describe('InMemoryProductRepository', () => {
  let repository: InMemoryProductRepository;

  beforeEach(() => {
    repository = new InMemoryProductRepository();
  });

  it('debe inicializar con los productos de prueba sembrados', async () => {
    const products = await repository.findAll();
    expect(products.length).toBeGreaterThanOrEqual(2);
    expect(products[0].id).toBe('prod-1');
  });

  it('debe encontrar un producto por su ID', async () => {
    const product = await repository.findById('prod-1');
    expect(product).toBeDefined();
    expect(product?.name).toContain('CF MOTO');
  });

  it('debe descontar stock correctamente cuando hay existencias suficientes', async () => {
    const initialProduct = await repository.findById('prod-1');
    const initialStock = initialProduct!.stock;

    const success = await repository.decrementStock('prod-1', 1);
    const updatedProduct = await repository.findById('prod-1');

    expect(success).toBe(true);
    expect(updatedProduct?.stock).toBe(initialStock - 1);
  });

  it('no debe descontar stock si la cantidad solicitada supera la disponible', async () => {
    const success = await repository.decrementStock('prod-1', 9999);
    expect(success).toBe(false);
  });
});