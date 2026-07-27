// src/components/steps/__tests__/Step4TransactionStatus.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from '../../../store/slices/checkoutSlice';
import { Step4TransactionStatus } from '../Step4TransactionStatus';
import { checkoutApi } from '../../../api/checkoutApi';

jest.mock('../../../api/checkoutApi');
const mockedApi = checkoutApi as jest.Mocked<typeof checkoutApi>;

const createMockStore = (status: 'APPROVED' | 'DECLINED') =>
  configureStore({
    reducer: {
      checkout: checkoutReducer,
    },
    preloadedState: {
      checkout: {
        step: 4,
        products: [],
        selectedProduct: {
          id: 'p1',
          name: 'CF MOTO 450NK Scale Model',
          description: 'Model 1:12',
          price: 185000,
          stock: 4,
        },
        quantity: 1,
        customerData: null,
        deliveryData: null,
        cardData: null,
        transactionId: 'tx-wompi-888',
        transactionStatus: status,
        loadingProducts: false,
        loadingPayment: false,
        error: status === 'DECLINED' ? 'Fondos insuficientes' : null,
      },
    },
  });

describe('Step4TransactionStatus - Resultado del Pago', () => {
  it('debe renderizar la pantalla de exito cuando la transaccion es APPROVED', () => {
    const store = createMockStore('APPROVED');
    render(
      <Provider store={store}>
        <Step4TransactionStatus />
      </Provider>
    );

    expect(screen.getByText(/¡Pago Aprobado!/i)).toBeInTheDocument();
    expect(screen.getByText('tx-wompi-888')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('debe renderizar el mensaje de rechazo cuando la transaccion es DECLINED', () => {
    const store = createMockStore('DECLINED');
    render(
      <Provider store={store}>
        <Step4TransactionStatus />
      </Provider>
    );

    expect(screen.getByText(/Transacción Rechazada/i)).toBeInTheDocument();
    expect(screen.getByText(/Fondos insuficientes/i)).toBeInTheDocument();
  });

  it('debe reiniciar el flujo y recargar catalogo al presionar "Volver a la Tienda"', () => {
    mockedApi.getProducts.mockResolvedValueOnce([]);
    const store = createMockStore('APPROVED');

    render(
      <Provider store={store}>
        <Step4TransactionStatus />
      </Provider>
    );

    const returnBtn = screen.getByRole('button', { name: /Volver a la Tienda/i });
    fireEvent.click(returnBtn);

    const state = store.getState().checkout;
    expect(state.step).toBe(1);
    expect(state.selectedProduct).toBeNull();
    expect(state.transactionId).toBeNull();
    expect(mockedApi.getProducts).toHaveBeenCalledTimes(1);
  });
});