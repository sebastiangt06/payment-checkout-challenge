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

const LOCAL_KEY = 'checkout_state_v1';

const loadSavedState = (): Partial<CheckoutState> => {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return {
      step: parsed.step || 1,
      selectedProduct: parsed.selectedProduct || null,
      quantity: parsed.quantity || 1,
      customerData: parsed.customerData || null,
      deliveryData: parsed.deliveryData || null,
      cardData: parsed.cardData || null,
      transactionId: parsed.transactionId || null,
      transactionStatus: parsed.transactionStatus || 'IDLE',
    };
  } catch {
    return {};
  }
};

const savedState = loadSavedState();

const initialState: CheckoutState = {
  step: savedState.step || 1,
  products: [],
  selectedProduct: savedState.selectedProduct || null,
  quantity: savedState.quantity || 1,
  customerData: savedState.customerData || null,
  deliveryData: savedState.deliveryData || null,
  cardData: savedState.cardData || null,
  transactionId: savedState.transactionId || null,
  transactionStatus: savedState.transactionStatus || 'IDLE',
  loadingProducts: false,
  loadingPayment: false,
  error: null,
};

export const fetchProducts = createAsyncThunk('checkout/fetchProducts', async () => {
  return await checkoutApi.getProducts();
});

export const submitTransaction = createAsyncThunk(
  'checkout/submitTransaction',
  async (payload: {
    productId: string;
    quantity: number;
    customerData: CustomerData;
    deliveryData: DeliveryData;
  }) => {
    return await checkoutApi.createTransaction(payload);
  }
);

export const executePayment = createAsyncThunk(
  'checkout/executePayment',
  async (payload: { transactionId: string; cardData: CardData }) => {
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
    },
    // Guarda en Redux los campos mientras el usuario los digita
    updateDraftForm: (
      state,
      action: PayloadAction<{
        customer?: Partial<CustomerData>;
        delivery?: Partial<DeliveryData>;
        card?: Partial<CardData>;
      }>
    ) => {
      if (action.payload.customer) {
        state.customerData = { ...(state.customerData || {}), ...action.payload.customer } as CustomerData;
      }
      if (action.payload.delivery) {
        state.deliveryData = { ...(state.deliveryData || {}), ...action.payload.delivery } as DeliveryData;
      }
      if (action.payload.card) {
        state.cardData = { ...(state.cardData || {}), ...action.payload.card } as CardData;
      }
    },
    setFormData: (
      state,
      action: PayloadAction<{ customer: CustomerData; delivery: DeliveryData; card: CardData }>
    ) => {
      state.customerData = action.payload.customer;
      state.deliveryData = action.payload.delivery;
      state.cardData = action.payload.card;
      state.step = 3;
    },
    closeModal: (state) => {
      state.step = 1;
    },
    resetFlow: (state) => {
      localStorage.removeItem(LOCAL_KEY);
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loadingProducts = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loadingProducts = false;
        let loadedProducts: Product[] = [];
        if (Array.isArray(action.payload)) {
          loadedProducts = action.payload;
        } else if (action.payload && Array.isArray((action.payload as any).data)) {
          loadedProducts = (action.payload as any).data;
        }
        state.products = loadedProducts;

        if (state.selectedProduct) {
          const updated = loadedProducts.find((p) => p.id === state.selectedProduct?.id);
          if (updated) {
            state.selectedProduct = updated;
          }
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loadingProducts = false;
        state.error = action.error.message || 'Error al cargar productos desde la API';
      })
      .addCase(submitTransaction.pending, (state) => {
        state.loadingPayment = true;
        state.error = null;
      })
      .addCase(submitTransaction.fulfilled, (state, action) => {
        state.transactionId = action.payload.id;
        state.transactionStatus = 'PENDING';
      })
      .addCase(executePayment.pending, (state) => {
        state.loadingPayment = true;
      })
      .addCase(executePayment.fulfilled, (state, action) => {
        state.loadingPayment = false;
        state.transactionStatus = action.payload.status === 'APPROVED' ? 'APPROVED' : 'DECLINED';
        state.step = 4;
      })
      .addCase(executePayment.rejected, (state, action) => {
        state.loadingPayment = false;
        state.transactionStatus = 'DECLINED';
        state.error = action.error.message || 'Error al procesar el pago';
        state.step = 4;
      });
  },
});

export const { selectProduct, updateDraftForm, setFormData, closeModal, resetFlow } = checkoutSlice.actions;
export default checkoutSlice.reducer;