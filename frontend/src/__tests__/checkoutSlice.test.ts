// src/store/__tests__/checkoutSlice.test.ts
import checkoutReducer, {
  selectProduct,
  setFormData,
  setTransactionPending,
  setTransactionResult,
  resetFlow,
  initialState,
  LOCAL_STORAGE_KEY,
} from '../slices/checkoutSlice';
import type { Product, CustomerData, DeliveryData, CardData } from '../../types';

describe('checkoutSlice - Reducer y Resiliencia en LocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const mockProduct: Product = {
    id: 'prod-123',
    name: 'CF MOTO 450NK Scale Model',
    description: 'Scale model 1:12',
    price: 185000,
    stock: 5,
  };

  const mockCustomer: CustomerData = {
    fullName: 'Koby Bryant',
    email: 'koby@example.com',
    phone: '3001234567',
  };

  const mockDelivery: DeliveryData = {
    address: 'Calle 10 # 5-20',
    city: 'Cali',
    region: 'Valle del Cauca',
  };

  const mockCard: CardData = {
    number: '4000123456789010',
    cardHolder: 'Koby Bryant',
    expDate: '12/28',
    cvc: '123',
    cardType: 'VISA',
  };

  it('debe seleccionar un producto, cambiar al paso 2 y guardar en localStorage', () => {
    const nextState = checkoutReducer(
      initialState,
      selectProduct({ product: mockProduct, quantity: 2 })
    );

    expect(nextState.step).toBe(2);
    expect(nextState.selectedProduct).toEqual(mockProduct);
    expect(nextState.quantity).toBe(2);

    const savedInStorage = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    expect(savedInStorage.selectedProduct.id).toBe('prod-123');
  });

  it('debe registrar el formulario, cambiar al paso 3 y guardar en localStorage', () => {
    const nextState = checkoutReducer(
      initialState,
      setFormData({ customer: mockCustomer, delivery: mockDelivery, card: mockCard })
    );

    expect(nextState.step).toBe(3);
    expect(nextState.customerData).toEqual(mockCustomer);
    expect(nextState.deliveryData).toEqual(mockDelivery);
    expect(nextState.cardData).toEqual(mockCard);
  });

  it('debe marcar la transacción como PENDING', () => {
    const nextState = checkoutReducer(
      initialState,
      setTransactionPending('tx-abc-123')
    );

    expect(nextState.transactionId).toBe('tx-abc-123');
    expect(nextState.transactionStatus).toBe('PENDING');
  });

  it('debe registrar el resultado APPROVED y pasar al paso 4', () => {
    const nextState = checkoutReducer(
      initialState,
      setTransactionResult({ status: 'APPROVED' })
    );

    expect(nextState.step).toBe(4);
    expect(nextState.transactionStatus).toBe('APPROVED');
    expect(nextState.error).toBeNull();
  });

  it('debe reiniciar el flujo y borrar el localStorage al ejecutar resetFlow', () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ step: 4 }));

    const nextState = checkoutReducer(initialState, resetFlow());

    expect(nextState.step).toBe(1);
    expect(nextState.selectedProduct).toBeNull();
    expect(nextState.transactionId).toBeNull();
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();
  });
});