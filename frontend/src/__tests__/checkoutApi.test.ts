// src/api/__tests__/checkoutApi.test.ts
import axiosClient from '../axiosClient';
import { checkoutApi } from '../checkoutApi';
import type { Product, Transaction } from '../../types';

jest.mock('../axiosClient');
const mockedAxios = axiosClient as jest.Mocked<typeof axiosClient>;

describe('checkoutApi - Integración de Endpoints HTTP', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe realizar la petición GET /products y retornar la lista de productos', async () => {
    const mockProducts: Product[] = [
      { id: 'p1', name: 'Moto scale', description: 'Scale 1:12', price: 1000, stock: 5 },
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: mockProducts });

    const result = await checkoutApi.getProducts();

    expect(mockedAxios.get).toHaveBeenCalledWith('/products');
    expect(result).toEqual(mockProducts);
  });

  it('debe realizar la petición POST /transactions y crear transacción PENDING', async () => {
    const mockTx: Partial<Transaction> = { id: 'tx-1', status: 'PENDING' };
    mockedAxios.post.mockResolvedValueOnce({ data: mockTx });

    const payload = {
      productId: 'p1',
      quantity: 1,
      customerData: { fullName: 'Test', email: 'test@mail.com', phone: '123' },
      deliveryData: { address: 'Calle 1', city: 'Cali', region: 'Valle' },
    };

    const result = await checkoutApi.createTransaction(payload);

    expect(mockedAxios.post).toHaveBeenCalledWith('/transactions', payload);
    expect(result.status).toBe('PENDING');
  });

  it('debe realizar la petición POST /transactions/:id/process para procesar pago', async () => {
    const mockTx: Partial<Transaction> = { id: 'tx-1', status: 'APPROVED' };
    mockedAxios.post.mockResolvedValueOnce({ data: mockTx });

    const cardData = {
      number: '4000123456789010',
      cardHolder: 'Test',
      expDate: '12/28',
      cvc: '123',
      cardType: 'VISA' as const,
    };

    const result = await checkoutApi.processPayment({ transactionId: 'tx-1', cardData });

    expect(mockedAxios.post).toHaveBeenCalledWith('/transactions/tx-1/process', { cardData });
    expect(result.status).toBe('APPROVED');
  });
});