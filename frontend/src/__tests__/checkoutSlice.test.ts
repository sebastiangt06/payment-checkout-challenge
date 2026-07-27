import { describe, it, expect } from 'vitest';
import checkoutReducer, {
  selectProduct,
  setFormData,
  resetFlow,
  type CheckoutState,
} from '@/store/slices/checkoutSlice';

const mockProduct = {
  id: '1',
  name: 'CF MOTO 450NK Scale Model',
  description: 'Test Moto',
  price: 185000,
  stock: 5,
};

describe('checkoutSlice Reducer', () => {
  const initialState: CheckoutState = {
    step: 1,
    products: [],
    selectedProduct: null,
    quantity: 1,
    customerData: null,
    deliveryData: null,
    cardData: null,
    transactionId: null,
    transactionStatus: 'IDLE',
    loadingProducts: false,
    loadingPayment: false,
    error: null,
  };

  it('debe seleccionar un producto y avanzar al Paso 2', () => {
    const nextState = checkoutReducer(
      initialState,
      selectProduct({ product: mockProduct, quantity: 2 })
    );

    expect(nextState.step).toBe(2);
    expect(nextState.selectedProduct).toEqual(mockProduct);
    expect(nextState.quantity).toBe(2);
  });

  it('debe resetear el flujo y volver al Paso 1 con resetFlow', () => {
    const activeState: CheckoutState = {
      ...initialState,
      step: 3,
      selectedProduct: mockProduct,
    };

    const nextState = checkoutReducer(activeState, resetFlow());
    expect(nextState.step).toBe(1);
    expect(nextState.selectedProduct).toBeNull();
  });
});