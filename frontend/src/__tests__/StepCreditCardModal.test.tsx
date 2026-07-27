// src/components/steps/__tests__/Step2CreditCardModal.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from '../../../store/slices/checkoutSlice';
import { Step2CreditCardModal } from '../Step2CreditCardModal';

const createMockStore = (initialStep: 1 | 2 | 3 | 4 = 2) =>
  configureStore({
    reducer: {
      checkout: checkoutReducer,
    },
    preloadedState: {
      checkout: {
        step: initialStep,
        products: [],
        selectedProduct: {
          id: 'p1',
          name: 'Moto Model',
          description: 'Desc',
          price: 10000,
          stock: 3,
        },
        quantity: 1,
        customerData: null,
        deliveryData: null,
        cardData: null,
        transactionId: null,
        transactionStatus: 'IDLE',
        loadingProducts: false,
        loadingPayment: false,
        error: null,
      },
    },
  });

describe('Step2CreditCardModal - Formulario de Pago y Envío', () => {
  it('debe renderizar todos los campos obligatorios del formulario', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Step2CreditCardModal />
      </Provider>
    );

    expect(screen.getByPlaceholderText(/Nombre completo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Dirección de residencia/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Número de tarjeta/i)).toBeInTheDocument();
  });

  it('debe detectar la franquicia VISA al ingresar un número que comience por 4', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Step2CreditCardModal />
      </Provider>
    );

    const cardInput = screen.getByPlaceholderText(/Número de tarjeta/i);
    fireEvent.change(cardInput, { target: { value: '4000123456789010' } });

    expect(screen.getByTestId('brand-badge')).toHaveTextContent('VISA');
  });

  it('debe enviar el formulario con datos válidos y avanzar al Paso 3', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Step2CreditCardModal />
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText(/Nombre completo/i), {
      target: { value: 'Koby Bryant' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Correo electrónico/i), {
      target: { value: 'koby@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Teléfono/i), {
      target: { value: '3001234567' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Dirección de residencia/i), {
      target: { value: 'Calle 10 # 5-20' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ciudad/i), {
      target: { value: 'Cali' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Número de tarjeta/i), {
      target: { value: '4000123456789010' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Nombre en la tarjeta/i), {
      target: { value: 'Koby Bryant' },
    });
    fireEvent.change(screen.getByPlaceholderText(/MM\/YY/i), {
      target: { value: '1228' },
    });
    fireEvent.change(screen.getByPlaceholderText(/CVC/i), {
      target: { value: '123' },
    });

    const submitBtn = screen.getByRole('button', { name: /Continuar al Resumen/i });
    fireEvent.click(submitBtn);

    const state = store.getState().checkout;
    expect(state.step).toBe(3);
    expect(state.customerData?.fullName).toBe('Koby Bryant');
    expect(state.deliveryData?.city).toBe('Cali');
    expect(state.cardData?.cardType).toBe('VISA');
  });
});