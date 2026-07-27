// src/__tests__/checkoutApi.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import axiosClient from '../api/axiosClient';
import axios from 'axios';
import { checkoutApi } from '../api/checkoutApi';

// Mock explícito con fábrica para axiosClient y axios
vi.mock('../api/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedAxiosClient = vi.mocked(axiosClient);
const mockedAxios = vi.mocked(axios);

describe('checkoutApi - Integración de Endpoints HTTP', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debe realizar la petición GET /products y retornar la lista de productos', async () => {
    const mockProducts = [{ id: '1', name: 'Product 1', price: 100, stock: 5 }];
    mockedAxiosClient.get.mockResolvedValueOnce({ data: { data: mockProducts } });

    const products = await checkoutApi.getProducts();
    expect(mockedAxiosClient.get).toHaveBeenCalledWith('/products');
    expect(products).toEqual(mockProducts);
  });

  it('debe realizar la petición POST /transactions y crear transacción PENDING', async () => {
    const payload = {
      productId: 'p1',
      quantity: 1,
      customerData: { fullName: 'Test', email: 'test@mail.com', phone: '123' },
      deliveryData: { address: 'Calle 1', city: 'Cali', region: 'Valle' },
    };

    const mockResponse = { id: 't1', status: 'PENDING' };
    mockedAxiosClient.post.mockResolvedValueOnce({ data: { data: mockResponse } });

    const result = await checkoutApi.createTransaction(payload);

    expect(mockedAxiosClient.post).toHaveBeenCalledWith('/transactions', {
      productId: 'p1',
      quantity: 1,
      customerData: {
        name: 'Test',
        email: 'test@mail.com',
      },
      deliveryData: {
        address: 'Calle 1',
        city: 'Cali',
        phone: '123',
      },
    });
    expect(result.status).toBe('PENDING');
  });

  it('debe realizar la petición POST /transactions/:id/process para procesar pago', async () => {
    const payload = {
      transactionId: 'tx123',
      cardData: {
        number: '4242424242424242',
        cardHolder: 'JUAN PEREZ',
        expDate: '12/28',
        cvc: '123',
        cardType: 'VISA',
      },
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: { data: { id: 'tok_test_123' } },
    });

    mockedAxiosClient.post.mockResolvedValueOnce({
      data: { data: { id: 'tx123', status: 'APPROVED' } },
    });

    const result = await checkoutApi.processPayment(payload);
    expect(result.status).toBe('APPROVED');
  });
});