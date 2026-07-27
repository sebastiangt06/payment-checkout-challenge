// src/components/steps/__tests__/Step3SummaryBackdrop.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from '../../../store/slices/checkoutSlice';
import { Step3SummaryBackdrop } from '../Step3SummaryBackdrop';
import { checkoutApi } from '../../../api/checkoutApi';

jest.mock('../../../api/checkoutApi');
const mockedApi = checkoutApi as jest.Mocked<typeof checkoutApi>;

const createMockStore = () =>
  configureStore({
    reducer: {
      checkout: checkoutReducer,
    },
    preloadedState: {
      checkout: {
        step: 3,
        products: [],
        selectedProduct: {
          id: 'p1',
          name: 'CF MOTO 450NK Scale Model',
          description: 'Model 1:12',
          price: 185000,
          stock: 3,
        },
        quantity: 1,
        customerData: {
          fullName: 'Koby Bryant',
          email: 'koby@example.com',
          phone: '3001234567',
        },
        deliveryData: {
          address: 'Calle 10 # 5-20',
          city: 'Cali',
          region: 'Valle del Cauca',
        },
        cardData: {
          number: '4000123456789010',
          cardHolder: 'Koby Bryant',
          expDate: '12/28',
          cvc: '123',
          cardType: 'VISA',
        },
        transactionId: null,
        transactionStatus: 'IDLE',
        loadingProducts: false,
        loadingPayment: false,
        error: null,
      },
    },
  });

describe('Step3SummaryBackdrop - Componente Resumen de Pago', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe calcular y mostrar el desglose de tarifas correcto ($185.000 + $3.000 + $10.000 = $198.000)', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Step3SummaryBackdrop />
      </Provider>
    );

    expect(screen.getByText(/Resumen de la Compra/i)).toBeInTheDocument();
    expect(screen.getByText(/Base Fee/i)).toBeInTheDocument();
    expect(screen.getByText(/Delivery Fee/i)).toBeInTheDocument();

    // Valida que el botón contenga el precio total formateado
    expect(screen.getByRole('button', { name: /Confirmar y Pagar/i })).toBeInTheDocument();
  });

  it('debe ejecutar la secuencia asíncrona de creación de transacción y pago al hacer clic', async () => {
    const store = createMockStore();

    mockedApi.createTransaction.mockResolvedValueOnce({
      id: 'tx-001',
      status: 'PENDING',
      amountInCents: 19800000,
      reference: 'ref-001',
      createdAt: new Date().toISOString(),
    });

    mockedApi.processPayment.mockResolvedValueOnce({
      id: 'tx-001',
      status: 'APPROVED',
      amountInCents: 19800000,
      reference: 'ref-001',
      createdAt: new Date().toISOString(),
    });

    render(
      <Provider store={store}>
        <Step3SummaryBackdrop />
      </Provider>
    );

    const payButton = screen.getByRole('button', { name: /Confirmar y Pagar/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(mockedApi.createTransaction).toHaveBeenCalledTimes(1);
      expect(mockedApi.processPayment).toHaveBeenCalledWith({
        transactionId: 'tx-001',
        cardData: expect.objectContaining({ number: '4000123456789010' }),
      });
    });

    const state = store.getState().checkout;
    expect(state.step).toBe(4);
    expect(state.transactionStatus).toBe('APPROVED');
  });
});