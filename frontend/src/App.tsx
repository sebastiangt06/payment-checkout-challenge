// src/App.tsx
import React, { useEffect } from 'react';
import { Header } from './components/common/Header';
import { StepProductCard } from '@/components/steps/StepProductCard';
import { StepCreditCardModal } from '@/components/steps/StepCreditCardModal';
import { StepSummaryBackdrop } from '@/components/steps/StepSummaryBackdrop';
import { useAppDispatch, useAppSelector } from './store';
import { fetchProducts } from './store/slices/checkoutSlice';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { step, products, loadingProducts, error } = useAppSelector(
    (state) => state.checkout
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-[375px] sm:max-w-md w-full mx-auto p-4 flex flex-col justify-center">
        {step >= 1 && (
          <>
            {loadingProducts && (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-500">Cargando productos...</p>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-xl text-center">
                {error}
              </div>
            )}

            {!loadingProducts && !error && products.length > 0 && (
              <div className="space-y-4">
                {products.map((product) => (
                  <StepProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Paso 2: Modal de Envío y Tarjeta */}
        {step === 2 && <StepCreditCardModal />}

        {/* Paso 3: Resumen de Pago en Backdrop */}
        {step === 3 && <StepSummaryBackdrop />}
      </main>
    </div>
  );
};

export default App;