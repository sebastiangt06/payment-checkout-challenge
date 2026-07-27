// src/components/steps/Step2CreditCardModal.tsx
import React, { useState } from 'react';
import type { CustomerData, DeliveryData, CardData } from '../../types';
import { detectCardBrand, validateLuhn } from '../../utils/cardUtils';
import { useAppDispatch } from '../../store';
import { setFormData } from '../../store/slices/checkoutSlice';

export const StepCreditCardModal: React.FC = () => {
  const dispatch = useAppDispatch();

  // Datos personales
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Datos de entrega
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('Valle del Cauca');

  // Datos de tarjeta
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvc, setCvc] = useState('');

  // Errores de validación
  const [cardError, setCardError] = useState<string | null>(null);

  const brand = detectCardBrand(cardNumber);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Formatea agregando espacios cada 4 dígitos para mejor UX
    const clean = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = clean.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);

    if (clean.length >= 13 && !validateLuhn(clean)) {
      setCardError('Número de tarjeta inválido (Fallo Luhn)');
    } else {
      setCardError(null);
    }
  };

  const handleExpDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      setExpDate(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setExpDate(clean);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!validateLuhn(cleanCardNumber)) {
      setCardError('Verifica el número de tarjeta ingresado.');
      return;
    }

    const customer: CustomerData = { fullName, email, phone };
    const delivery: DeliveryData = { address, city, region };
    const card: CardData = {
      number: cleanCardNumber,
      cardHolder,
      expDate,
      cvc,
      cardType: brand,
    };

    dispatch(setFormData({ customer, delivery, card }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-[375px] sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Datos de Envío y Pago</h3>
            <p className="text-[11px] text-slate-500">Ingresa tu información para completar la compra</p>
          </div>
          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
            Paso 2 de 4
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Información Personal */}
          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            1. Cliente
          </div>
          <input
            required
            type="text"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              required
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <input
              required
              type="tel"
              placeholder="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Dirección de Entrega */}
          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider pt-2">
            2. Dirección de Despacho
          </div>
          <input
            required
            type="text"
            placeholder="Dirección de residencia"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              required
              type="text"
              placeholder="Ciudad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <input
              required
              type="text"
              placeholder="Departamento"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Datos de Tarjeta */}
          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider pt-2">
            3. Tarjeta de Crédito (Sandbox)
          </div>
          <div className="relative">
            <input
              required
              type="text"
              placeholder="Número de tarjeta (4000...)"
              value={cardNumber}
              onChange={handleCardNumberChange}
              className={`w-full p-2.5 border rounded-xl text-xs pr-16 focus:ring-2 focus:outline-none ${
                cardError ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:ring-indigo-500'
              }`}
            />
            <span
              data-testid="brand-badge"
              className="absolute right-2 top-2 text-[10px] font-extrabold px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200"
            >
              {brand}
            </span>
          </div>

          {cardError && (
            <p className="text-[10px] text-rose-600 font-semibold">{cardError}</p>
          )}

          <input
            required
            type="text"
            placeholder="Nombre en la tarjeta"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              required
              type="text"
              placeholder="MM/YY"
              maxLength={5}
              value={expDate}
              onChange={handleExpDateChange}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <input
              required
              type="password"
              placeholder="CVC"
              maxLength={4}
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md text-xs uppercase tracking-wide transition-all active:scale-[0.98]"
          >
            Continuar al Resumen
          </button>
        </form>
      </div>
    </div>
  );
};