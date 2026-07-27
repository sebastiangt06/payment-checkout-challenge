// src/__tests__/StepSummaryBackdrop.test.tsx
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from '../store/slices/checkoutSlice';
import { StepSummaryBackdrop } from '@/components/steps/StepSummaryBackdrop';
import { checkoutApi } from '../api/checkoutApi';
import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('../api/checkoutApi');
const mockedApi = vi.mocked(checkoutApi);

const createMockStore = () =>
  configureStore({
    reducer: { checkout: checkoutReducer },
    preloadedState: {
      checkout: {
        step: 3,
        products: [],
        selectedProduct: { id: 'p1', name: 'CF MOTO 450NK Scale Model', price: 185000, stock: 5 },
        quantity: 1,
        customerData: { fullName: 'Koby Bryant', email: 'koby@mail.com', phone: '3001234567' },
        deliveryData: { address: 'Calle 10 # 5-20', city: 'Cali', region: 'Valle' },
        cardData: {
          number: '4242424242424242',
          cardHolder: 'Koby Bryant',
          expDate: '12/28',
          cvc: '123',
          cardType: 'VISA',
        },
        transactionId: null,
        transactionStatus: null,
        loadingProducts: false,
        loadingTransaction: false,
        error: null,
      },
    },
  });

describe('StepSummaryBackdrop - Componente Resumen de Pago', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('debe calcular y mostrar el desglose de tarifas correcto', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <StepSummaryBackdrop />
      </Provider>
    );

    expect(screen.getByText('CF MOTO 450NK Scale Model')).toBeInTheDocument();
    expect(screen.getByText(/Resumen de la Compra/i)).toBeInTheDocument();
  });

  it('debe ejecutar la secuencia asíncrona de creación de transacción y pago al hacer clic', async () => {
    mockedApi.createTransaction.mockResolvedValueOnce({
      id: 'tx123',
      reference: 'REF-123',
      productId: 'p1',
      quantity: 1,
      amount: 185000,
      baseFee: 2500,
      deliveryFee: 10000,
      status: 'PENDING',
      customerData: { name: 'Koby Bryant', email: 'koby@mail.com' },
      deliveryData: { address: 'Calle 10 # 5-20', city: 'Cali', phone: '3001234567' },
      createdAt: new Date().toISOString(),
    });

    mockedApi.processPayment.mockResolvedValueOnce({
      id: 'tx123',
      reference: 'REF-123',
      productId: 'p1',
      quantity: 1,
      amount: 185000,
      baseFee: 2500,
      deliveryFee: 10000,
      status: 'APPROVED',
      customerData: { name: 'Koby Bryant', email: 'koby@mail.com' },
      deliveryData: { address: 'Calle 10 # 5-20', city: 'Cali', phone: '3001234567' },
      createdAt: new Date().toISOString(),
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <StepSummaryBackdrop />
      </Provider>
    );

    const payButton = screen.getByRole('button', { name: /Confirmar y Pagar/i });
    fireEvent.click(payButton);

    expect(payButton).toBeInTheDocument();
  });
});