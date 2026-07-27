// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from './slices/checkoutSlice';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

export const store = configureStore({
  reducer: {
    checkout: checkoutReducer,
  },
});

// Suscripción al store: Guarda en localStorage de forma limpia cada vez que el estado cambia
store.subscribe(() => {
  try {
    const state = store.getState().checkout;
    const stateToSave = {
      step: state.step,
      selectedProduct: state.selectedProduct,
      quantity: state.quantity,
      customerData: state.customerData,
      deliveryData: state.deliveryData,
      cardData: state.cardData,
      transactionId: state.transactionId,
      transactionStatus: state.transactionStatus,
    };
    localStorage.setItem('checkout_state_v1', JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;