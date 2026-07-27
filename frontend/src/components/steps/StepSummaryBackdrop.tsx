// src/components/steps/Step3SummaryBackdrop.tsx
import React from 'react';
import { formatCOP } from '@/utils/currencyFormater';
import { useAppDispatch, useAppSelector } from '../../store';
import { submitTransaction, executePayment } from '../../store/slices/checkoutSlice';

export const StepSummaryBackdrop: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    selectedProduct,
    quantity,
    customerData,
    deliveryData,
    cardData,
    loadingPayment,
    error,
  } = useAppSelector((state) => state.checkout);

  if (!selectedProduct || !customerData || !deliveryData || !cardData) {
    return null;
  }

  // Desglose de costos exigido por la prueba
  const productTotal = selectedProduct.price * quantity;
  const baseFee = 3000;       // Tarifa base fija ($3.000 COP)
  const deliveryFee = 10000;  // Tarifa de envío ($10.000 COP)
  const grandTotal = productTotal + baseFee + deliveryFee;

  const handlePayClick = async () => {
    try {
      // Paso A: Crear transacción en PENDING en nuestro backend API
      const transactionAction = await dispatch(
        submitTransaction({
          productId: selectedProduct.id,
          quantity,
          customerData,
          deliveryData,
        })
      ).unwrap();

      if (transactionAction?.id) {
        // Paso B: Procesar la transacción enviando datos de tarjeta a Wompi Sandbox
        await dispatch(
          executePayment({
            transactionId: transactionAction.id,
            cardData,
          })
        );
      }
    } catch (err) {
      console.error('Error durante la secuencia de pago:', err);
    }
  };

  return (
    // Componente Backdrop (overlay oscuro semi-transparente)
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-[375px] sm:max-w-md rounded-2xl p-5 shadow-2xl border border-slate-100 animate-slide-up">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Resumen de la Compra</h3>
            <p className="text-[11px] text-slate-500">Confirma los detalles antes de procesar</p>
          </div>
          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
            Paso 3 de 4
          </span>
        </div>

        {/* Resumen del Pedido y Tarifas */}
        <div className="bg-slate-50 rounded-xl p-3.5 space-y-2.5 border border-slate-200/80 mb-4 text-xs">
          <div className="flex justify-between items-center text-slate-700">
            <span className="font-medium">
              {selectedProduct.name} <strong className="text-indigo-600">(x{quantity})</strong>
            </span>
            <span className="font-semibold">{formatCOP(productTotal)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Base Fee (Tarifa de servicio)</span>
            <span className="font-medium text-slate-800">{formatCOP(baseFee)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Delivery Fee (Costo de envío)</span>
            <span className="font-medium text-slate-800">{formatCOP(deliveryFee)}</span>
          </div>

          <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center font-extrabold text-sm text-slate-900">
            <span>Total a Pagar</span>
            <span className="text-indigo-600 text-base">{formatCOP(grandTotal)}</span>
          </div>
        </div>

        {/* Resumen de entrega y método de pago */}
        <div className="space-y-2 text-[11px] text-slate-600 mb-4 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
          <div className="flex justify-between">
            <span className="font-bold text-slate-700">Envío a:</span>
            <span className="truncate max-w-[200px]">{deliveryData.address}, {deliveryData.city}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-slate-700">Tarjeta:</span>
            <span>{cardData.cardType} **** {cardData.number.slice(-4)}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Botón Final de Pago */}
        <button
          type="button"
          onClick={handlePayClick}
          disabled={loadingPayment}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wide flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loadingPayment ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Procesando con Wompi...</span>
            </>
          ) : (
            <span>Confirmar y Pagar {formatCOP(grandTotal)}</span>
          )}
        </button>
      </div>
    </div>
  );
};