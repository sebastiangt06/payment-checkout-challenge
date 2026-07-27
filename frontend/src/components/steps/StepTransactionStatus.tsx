// src/components/steps/Step4TransactionStatus.tsx
import React from 'react';
import { formatCOP } from '@/utils/currencyFormater';
import { useAppDispatch, useAppSelector } from '../../store';
import { resetFlow, fetchProducts } from '../../store/slices/checkoutSlice';

export const StepTransactionStatus: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    transactionStatus,
    transactionId,
    selectedProduct,
    quantity,
    error,
  } = useAppSelector((state) => state.checkout);

  const isApproved = transactionStatus === 'APPROVED';

  const handleReturnToShop = () => {
    // 1. Limpia el estado de checkout y localStorage
    dispatch(resetFlow());
    // 2. Consulta el backend/PostgreSQL en RDS para traer el stock actualizado
    dispatch(fetchProducts());
  };

  const productTotal = selectedProduct ? selectedProduct.price * quantity : 0;
  const grandTotal = productTotal + 3000 + 10000; // Producto + Base Fee + Delivery Fee

  return (
    <div className="w-full max-w-[375px] mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-5 text-center animate-slide-up">
      {/* Indicador Visual de Estado */}
      <div className="my-3 flex justify-center">
        {isApproved ? (
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-bold shadow-inner">
            ✓
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-3xl font-bold shadow-inner">
            ✕
          </div>
        )}
      </div>

      <h2 className="text-lg font-extrabold text-slate-900 mt-2">
        {isApproved ? '¡Pago Aprobado!' : 'Transacción Rechazada'}
      </h2>

      <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto">
        {isApproved
          ? 'Tu compra ha sido procesada con éxito y el producto será preparado para envío.'
          : error || 'No fue posible completar la transacción con la tarjeta suministrada.'}
      </p>

      {/* Detalles de la Transacción */}
      <div className="mt-5 bg-slate-50 rounded-xl p-3.5 text-left border border-slate-200/80 space-y-2 text-xs">
        <div className="flex justify-between items-center text-slate-600 border-b border-slate-200/60 pb-2">
          <span className="font-semibold text-slate-700">Referencia ID:</span>
          <span className="font-mono text-[10px] bg-slate-200/70 text-slate-800 px-1.5 py-0.5 rounded truncate max-w-[150px]">
            {transactionId || 'N/A'}
          </span>
        </div>

        {selectedProduct && (
          <div className="flex justify-between items-center text-slate-600">
            <span>Producto:</span>
            <span className="font-bold text-slate-800 truncate max-w-[160px]">
              {selectedProduct.name} (x{quantity})
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-600">
          <span>Monto Total:</span>
          <span className="font-bold text-slate-900">{formatCOP(grandTotal)}</span>
        </div>

        <div className="flex justify-between items-center text-slate-600">
          <span>Estado Wompi:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
              isApproved
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {transactionStatus}
          </span>
        </div>
      </div>

      {/* Botón para retornar a la tienda con stock actualizado */}
      <button
        type="button"
        onClick={handleReturnToShop}
        className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md text-xs uppercase tracking-wide transition-all active:scale-[0.98]"
      >
        Volver a la Tienda
      </button>
    </div>
  );
};