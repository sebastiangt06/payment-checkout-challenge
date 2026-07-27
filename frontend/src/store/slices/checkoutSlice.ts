// src/store/slices/checkoutSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Product, CustomerData, DeliveryData, CardData, TransactionStatus } from '../../types';
import { checkoutApi, type CreateTransactionPayload, type ProcessPaymentPayload } from '../../api/checkoutApi';

export interface CheckoutState {
  step: 1 | 2 | 3 | 4;
  products: Product[];
  selectedProduct: Product | null;
  quantity: number;
  customerData: CustomerData | null;
  deliveryData: DeliveryData | null;
  cardData: CardData | null;
  transactionId: string | null;
  transactionStatus: TransactionStatus;
  loadingProducts: boolean;
  loadingPayment: boolean;
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
  ...loadSavedState(),
};

const saveToLocalStorage = (state: CheckoutState) => {
  try {
    const { products, loadingProducts, loadingPayment, ...persistedState } = state;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(persistedState));
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
};

// ─── ASYNC THUNKS ────────────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk(
  'checkout/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      return await checkoutApi.getProducts();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener productos');
    }
  }
);

export const submitTransaction = createAsyncThunk(
  'checkout/submitTransaction',
  async (payload: CreateTransactionPayload, { rejectWithValue }) => {
    try {
      return await checkoutApi.createTransaction(payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear la transacción');
    }
  }
);

export const executePayment = createAsyncThunk(
  'checkout/executePayment',
  async (payload: ProcessPaymentPayload, { rejectWithValue }) => {
    try {
      return await checkoutApi.processPayment(payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al procesar el pago');
    }
  }
);

// ─── SLICE DEFINITION ────────────────────────────────────────────────────────

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
      state.loadingPayment = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loadingProducts = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loadingProducts = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loadingProducts = false;
        state.error = action.payload as string;
      })

      // submitTransaction
      .addCase(submitTransaction.pending, (state) => {
        state.loadingPayment = true;
        state.error = null;
      })
      .addCase(submitTransaction.fulfilled, (state, action) => {
        state.transactionId = action.payload.id;
        state.transactionStatus = 'PENDING';
        saveToLocalStorage(state);
      })
      .addCase(submitTransaction.rejected, (state, action) => {
        state.loadingPayment = false;
        state.transactionStatus = 'ERROR';
        state.error = action.payload as string;
        state.step = 4;
        saveToLocalStorage(state);
      })

      // executePayment
      .addCase(executePayment.pending, (state) => {
        state.loadingPayment = true;
      })
      .addCase(executePayment.fulfilled, (state, action) => {
        state.loadingPayment = false;
        state.transactionStatus = action.payload.status;
        state.step = 4;
        saveToLocalStorage(state);
      })
      .addCase(executePayment.rejected, (state, action) => {
        state.loadingPayment = false;
        state.transactionStatus = 'DECLINED';
        state.error = action.payload as string;
        state.step = 4;
        saveToLocalStorage(state);
      });
  },
});

export const { selectProduct, setFormData, resetFlow } = checkoutSlice.actions;

export default checkoutSlice.reducer;