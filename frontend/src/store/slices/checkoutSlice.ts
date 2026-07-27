// src/store/slices/checkoutSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { checkoutApi } from '../../api/checkoutApi';
import type { Product, CustomerData, DeliveryData, CardData, TransactionStatus } from '../../types';

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

const LOCAL_KEY = 'wompi_checkout_state_v1';

const loadSavedState = (): Partial<CheckoutState> => {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

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
  ...loadSavedState(),
};

export const fetchProducts = createAsyncThunk('checkout/fetchProducts', async () => {
  return await checkoutApi.getProducts();
});

export const submitTransaction = createAsyncThunk(
  'checkout/submitTransaction',
  async (
    payload: {
      productId: string;
      quantity: number;
      customerData: CustomerData;
      deliveryData: DeliveryData;
    },
    _
  ) => {
    return await checkoutApi.createTransaction(payload);
  }
);

export const executePayment = createAsyncThunk(
  'checkout/executePayment',
  async (
    payload: {
      transactionId: string;
      cardData: CardData;
    },
    _
  ) => {
    return await checkoutApi.processPayment(payload);
  }
);

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    selectProduct: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      state.selectedProduct = action.payload.product;
      state.quantity = action.payload.quantity;
      state.step = 2;
      localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
    },
    setFormData: (
      state,
      action: PayloadAction<{ customer: CustomerData; delivery: DeliveryData; card: CardData }>
    ) => {
      state.customerData = action.payload.customer;
      state.deliveryData = action.payload.delivery;
      state.cardData = action.payload.card;
      state.step = 3;
      localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
    },
    resetFlow: (state) => {
      localStorage.removeItem(LOCAL_KEY);
      state.step = 1;
      state.selectedProduct = null;
      state.customerData = null;
      state.deliveryData = null;
      state.cardData = null;
      state.transactionId = null;
      state.transactionStatus = 'IDLE';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
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
        state.error = action.error.message || 'Error al cargar productos desde la API';
      })
      // Submit Transaction
      .addCase(submitTransaction.pending, (state) => {
        state.loadingPayment = true;
        state.error = null;
      })
      .addCase(submitTransaction.fulfilled, (state, action) => {
        state.transactionId = action.payload.id;
        state.transactionStatus = 'PENDING';
      })
      // Execute Payment
      .addCase(executePayment.pending, (state) => {
        state.loadingPayment = true;
      })
      .addCase(executePayment.fulfilled, (state, action) => {
        state.loadingPayment = false;
        state.transactionStatus = action.payload.status === 'APPROVED' ? 'APPROVED' : 'DECLINED';
        state.step = 4;
        localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
      })
      .addCase(executePayment.rejected, (state, action) => {
        state.loadingPayment = false;
        state.transactionStatus = 'DECLINED';
        state.error = action.error.message || 'Error al procesar el pago con Wompi';
        state.step = 4;
        localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
      });
  },
});

export const { selectProduct, setFormData, resetFlow } = checkoutSlice.actions;
export default checkoutSlice.reducer;