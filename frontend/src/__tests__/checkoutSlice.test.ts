import checkoutReducer, { selectProduct, resetFlow } from './checkoutSlice';

describe('checkoutSlice Reducer', () => {
  const dummyProduct = {
    id: 'prod-123',
    name: 'CF MOTO 450NK Scale Model',
    description: 'Scale model',
    price: 185000,
    stock: 5,
  };

  it('debe seleccionar un producto y avanzar al paso 2', () => {
    const initialState = {
      step: 1 as const,
      products: [],
      selectedProduct: null,
      quantity: 1,
      customerData: { fullName: '', email: '', phone: '' },
      deliveryData: { address: '', city: '', region: '' },
      cardData: { number: '', cardHolder: '', expDate: '', cvc: '', cardType: 'UNKNOWN' as const },
      transactionId: null,
      transactionStatus: 'IDLE' as const,
      loading: false,
      error: null,
    };

    const nextState = checkoutReducer(initialState, selectProduct({ product: dummyProduct, quantity: 2 }));
    expect(nextState.step).toBe(2);
    expect(nextState.selectedProduct?.id).toBe('prod-123');
    expect(nextState.quantity).toBe(2);
  });

  it('debe reiniciar el flujo correctamente con resetFlow', () => {
    const activeState = {
      step: 4 as const,
      products: [],
      selectedProduct: dummyProduct,
      quantity: 2,
      customerData: { fullName: 'Koby', email: 'koby@example.com', phone: '123' },
      deliveryData: { address: 'Calle 10', city: 'Cali', region: 'Valle' },
      cardData: { number: '4000', cardHolder: 'Koby', expDate: '12/28', cvc: '123', cardType: 'VISA' as const },
      transactionId: 'tx-999',
      transactionStatus: 'APPROVED' as const,
      loading: false,
      error: null,
    };

    const resetState = checkoutReducer(activeState, resetFlow());
    expect(resetState.step).toBe(1);
    expect(resetState.selectedProduct).toBeNull();
    expect(resetState.transactionId).toBeNull();
  });
});