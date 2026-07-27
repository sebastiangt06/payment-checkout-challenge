// src/components/steps/__tests__/Step1ProductCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from '../../../store/slices/checkoutSlice';
import { Step1ProductCard } from '../Step1ProductCard';
import type { Product } from '../../../types';

const createMockStore = () =>
  configureStore({
    reducer: {
      checkout: checkoutReducer,
    },
  });

describe('Step1ProductCard - Componente de Producto', () => {
  const availableProduct: Product = {
    id: 'prod-001',
    name: 'CF MOTO 450NK Scale Model',
    description: 'Scale 1:12 high detail model',
    price: 185000,
    stock: 5,
  };

  const outOfStockProduct: Product = { ...availableProduct, stock: 0 };

  it('debe renderizar el nombre del producto, precio y el botón "Pay with credit card"', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Step1ProductCard product={availableProduct} />
      </Provider>
    );

    expect(screen.getByText('CF MOTO 450NK Scale Model')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Pay with credit card/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Pay with credit card/i })
    ).not.toBeDisabled();
  });

  it('debe deshabilitar el botón si el stock es 0', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Step1ProductCard product={outOfStockProduct} />
      </Provider>
    );

    const button = screen.getByRole('button', { name: /Sin stock disponible/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('debe despachar selectProduct y avanzar al paso 2 al hacer clic en el botón', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Step1ProductCard product={availableProduct} />
      </Provider>
    );

    const button = screen.getByRole('button', { name: /Pay with credit card/i });
    fireEvent.click(button);

    const state = store.getState().checkout;
    expect(state.step).toBe(2);
    expect(state.selectedProduct).toEqual(availableProduct);
  });
});