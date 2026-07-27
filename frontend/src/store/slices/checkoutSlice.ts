// src/store/slices/checkoutSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product, CustomerData, DeliveryData, CardData, TransactionStatus } from '../../types';

export interface CheckoutState {
  step: 1 | 2 | 3 | 4;
  selectedProduct: Product | null;
  quantity: number;
  customerData: CustomerData | null;
  deliveryData: DeliveryData | null;
  cardData: CardData | null;
  transactionId: string | null;
  transactionStatus: TransactionStatus;
  error: string | null;
}

export const LOCAL_STORAGE_KEY = 'wompi_checkout_state_v1';

const loadSavedState = (): Partial<CheckoutState> => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const initialState: CheckoutState = {
  step: 1,
  selectedProduct: null,
  quantity: 1,
  customerData: null,
  deliveryData: null,
  cardData: null,
  transactionId: null,
  transactionStatus: 'IDLE',
  error: null,
  ...loadSavedState(),
};

const saveToLocalStorage = (state: CheckoutState) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
};

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    selectProduct: (
      state,
      action: PayloadAction<{ product: Product; quantity: number }>
    ) => {
      state.selectedProduct = action.payload.product;
      state.quantity = action.payload.quantity;
      state.step = 2;
      saveToLocalStorage(state);
    },

    setFormData: (
      state,
      action: PayloadAction<{
        customer: CustomerData;
        delivery: DeliveryData;
        card: CardData;
      }>
    ) => {
      state.customerData = action.payload.customer;
      state.deliveryData = action.payload.delivery;
      state.cardData = action.payload.card;
      state.step = 3;
      saveToLocalStorage(state);
    },

    setTransactionPending: (state, action: PayloadAction<string>) => {
      state.transactionId = action.payload;
      state.transactionStatus = 'PENDING';
      saveToLocalStorage(state);
    },

    setTransactionResult: (
      state,
      action: PayloadAction<{ status: 'APPROVED' | 'DECLINED' | 'ERROR'; error?: string }>
    ) => {
      state.transactionStatus = action.payload.status;
      state.error = action.payload.error || null;
      state.step = 4;
      saveToLocalStorage(state);
    },

    resetFlow: (state) => {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      state.step = 1;
      state.selectedProduct = null;
      state.quantity = 1;
      state.customerData = null;
      state.deliveryData = null;
      state.cardData = null;
      state.transactionId = null;
      state.transactionStatus = 'IDLE';
      state.error = null;
    },
  },
});

export const {
  selectProduct,
  setFormData,
  setTransactionPending,
  setTransactionResult,
  resetFlow,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;