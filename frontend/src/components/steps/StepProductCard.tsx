// src/components/steps/Step1ProductCard.tsx
import React, { useState } from 'react';
import type { Product } from '../../types';
import { formatCOP } from '@/utils/currencyFormater';
import { useAppDispatch } from '../../store';
import { selectProduct } from '../../store/slices/checkoutSlice';

interface Props {
  product: Product;
}

export const StepProductCard: React.FC<Props> = ({ product }) => {
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = product.stock <= 0;

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(product.stock, prev + 1));
  };

  const handlePayClick = () => {
    if (!isOutOfStock) {
      dispatch(selectProduct({ product, quantity }));
    }
  };

  return (
    <div className="w-full max-w-[375px] mx-auto bg-white rounded-2xl border border-slate-200 shadow-md p-5 flex flex-col justify-between transition-all">
      <div>
        {/* Imagen Placeholder o Ilustración del producto */}
        <div className="w-full h-44 bg-slate-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-slate-100 relative">
          <span className="text-4xl">📦</span>
          <span
            className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm ${
              isOutOfStock
                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
          >
            {isOutOfStock ? 'Agotado' : `Stock: ${product.stock}`}
          </span>
        </div>

        <h2 className="text-lg font-bold text-slate-900 leading-snug">
          {product.name}
        </h2>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
          {product.description}
        </p>

        <div className="mt-4 text-xl font-extrabold text-slate-900">
          {formatCOP(product.price)}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {/* Selector de cantidad */}
        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
          <span className="text-xs font-semibold text-slate-600">Cantidad</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={isOutOfStock || quantity <= 1}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm shadow-sm"
            >
              -
            </button>
            <span className="font-bold text-slate-800 text-sm min-w-[16px] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={isOutOfStock || quantity >= product.stock}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm shadow-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* Botón Obligatorio de la prueba */}
        <button
          type="button"
          onClick={handlePayClick}
          disabled={isOutOfStock}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl shadow-md active:scale-[0.98] transition-all text-xs tracking-wide uppercase"
        >
          {isOutOfStock ? 'Sin stock disponible' : 'Pay with credit card'}
        </button>
      </div>
    </div>
  );
};