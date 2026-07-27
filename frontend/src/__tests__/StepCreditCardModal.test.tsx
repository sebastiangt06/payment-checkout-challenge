// src/__tests__/StepCreditCardModal.test.tsx
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from '../store/slices/checkoutSlice';
import { StepCreditCardModal } from '@/components/steps/StepCreditCardModal';
import { describe, it, expect, vi, afterEach } from 'vitest';

const createMockStore = () =>
  configureStore({
    reducer: { checkout: checkoutReducer },
    preloadedState: {
      checkout: {
        step: 2,
        products: [],
        selectedProduct: { id: 'p1', name: 'Product 1', price: 100000, stock: 5 },
        quantity: 1,
        customerData: null,
        deliveryData: null,
        cardData: null,
        transactionId: null,
        transactionStatus: null,
        loadingProducts: false,
        loadingTransaction: false,
        error: null,
      },
    },
  });

describe('StepCreditCardModal - Formulario de Pago y Envío', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('debe renderizar todos los campos obligatorios del formulario', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <StepCreditCardModal />
      </Provider>
    );

    expect(screen.getByPlaceholderText(/Nombre completo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Número de tarjeta/i)).toBeInTheDocument();
  });

  it('debe detectar la franquicia VISA al ingresar un número que comience por 4', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <StepCreditCardModal />
      </Provider>
    );

    const cardInput = screen.getByPlaceholderText(/Número de tarjeta/i);
    fireEvent.change(cardInput, { target: { value: '4242424242424242' } });

    expect(screen.getByAltText('Visa')).toBeInTheDocument();
  });

  it('debe enviar el formulario con datos válidos y avanzar al Paso 3', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <StepCreditCardModal />
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText(/Nombre completo/i), {
      target: { value: 'Koby Bryant' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Correo electrónico/i), {
      target: { value: 'koby@mail.com' },
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
      target: { value: '4242424242424242' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Nombre en la tarjeta/i), {
      target: { value: 'Koby Bryant' },
    });
    fireEvent.change(screen.getByPlaceholderText(/MM\/YY/i), {
      target: { value: '12/28' },
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
  });
});