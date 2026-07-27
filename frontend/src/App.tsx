// src/App.tsx
import React, { useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { StepProductCard } from '@/components/steps/StepProductCard';
import { StepCreditCardModal } from '@/components/steps/StepCreditCardModal';
import { StepSummaryBackdrop } from '@/components/steps/StepSummaryBackdrop';
import { StepTransactionStatus } from '@/components/steps/StepTransactionStatus';
import { useAppDispatch, useAppSelector } from './store';
import { fetchProducts } from '@/store/slices/checkoutSlice';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { step, products, loadingProducts, error } = useAppSelector(
    (state) => state.checkout
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {step >= 1 && (
          <>
            {loadingProducts && (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold text-slate-500">
                  Cargando productos de la tienda...
                </p>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-xl text-center max-w-md mx-auto">
                {error}
              </div>
            )}

            {!loadingProducts && !error && products.length > 0 && (
              <div className="flex flex-wrap justify-center items-stretch gap-6 w-full">
                {products.map((product) => (
                  <StepProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Modales y Backdrops del flujo */}
        {step === 2 && <StepCreditCardModal />}
        {step === 3 && <StepSummaryBackdrop />}
        {step === 4 && <StepTransactionStatus />}
      </main>
    </div>
  );
};

export default App;