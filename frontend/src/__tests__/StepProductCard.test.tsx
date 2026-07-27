import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { StepProductCard } from '@/components/steps/StepProductCard';
import { describe, it, expect } from 'vitest';

const mockProduct = {
  id: '19cbd695',
  name: 'CF MOTO 450NK Scale Model & Gear',
  description: 'Modelo a escala oficial',
  price: 185000,
  stock: 5,
};

describe('StepProductCard Component', () => {
  it('debe renderizar el título del producto y el botón "PAY WITH CREDIT CARD"', () => {
    render(
      <Provider store={store}>
        <StepProductCard product={mockProduct} />
      </Provider>
    );

    expect(screen.getByText(/CF MOTO 450NK/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PAY WITH CREDIT CARD/i })).toBeInTheDocument();
  });

  it('debe deshabilitar el botón si el stock es 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };

    render(
      <Provider store={store}>
        <StepProductCard product={outOfStockProduct} />
      </Provider>
    );

    const button = screen.getByRole('button', { name: /Sin stock disponible/i });
    expect(button).toBeDisabled();
  });
});