// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from './slices/checkoutSlice';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

export const store = configureStore({
  reducer: {
    checkout: checkoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks personalizados tipados
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;