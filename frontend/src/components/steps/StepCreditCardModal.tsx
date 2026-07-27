// src/components/steps/StepCreditCardModal.tsx
import React, { useState, useEffect } from "react";
import type { CustomerData, DeliveryData, CardData } from "../../types";
import { detectCardBrand, validateLuhn } from "../../utils/cardUtils";
import { useAppDispatch, useAppSelector } from "../../store";
import { setFormData, closeModal, updateDraftForm } from "../../store/slices/checkoutSlice";

export const StepCreditCardModal: React.FC = () => {
  const dispatch = useAppDispatch();

  const { customerData, deliveryData, cardData } = useAppSelector(
    (state) => state.checkout
  );

  const [fullName, setFullName] = useState(customerData?.fullName || "");
  const [email, setEmail] = useState(customerData?.email || "");
  const [phone, setPhone] = useState(customerData?.phone || "");

  const [address, setAddress] = useState(deliveryData?.address || "");
  const [city, setCity] = useState(deliveryData?.city || "");
  const [region, setRegion] = useState("Valle del Cauca");

  const [cardNumber, setCardNumber] = useState(cardData?.number || "");
  const [cardHolder, setCardHolder] = useState(cardData?.cardHolder || "");
  const [expDate, setExpDate] = useState(cardData?.expDate || "");
  const [cvc, setCvc] = useState(cardData?.cvc || "");

  const [cardError, setCardError] = useState<string | null>(null);
  const brand = detectCardBrand(cardNumber);

  // Auto-sincronización con Redux/localStorage mientras el usuario escribe
  useEffect(() => {
    dispatch(
      updateDraftForm({
        customer: { fullName, email, phone },
        delivery: { address, city, region },
        card: {
          number: cardNumber.replace(/\s/g, ""),
          cardHolder,
          expDate,
          cvc,
          cardType: brand,
        },
      })
    );
  }, [fullName, email, phone, address, city, region, cardNumber, cardHolder, expDate, cvc, brand, dispatch]);

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = clean.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);

    if (clean.length >= 13 && !validateLuhn(clean)) {
      setCardError("Número de tarjeta inválido (Fallo Luhn)");
    } else {
      setCardError(null);
    }
  };

  const handleExpDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (clean.length >= 3) {
      setExpDate(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setExpDate(clean);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    if (!validateLuhn(cleanCardNumber)) {
      setCardError("Verifica el número de tarjeta ingresado.");
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
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 cursor-pointer">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-[375px] sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl border border-slate-100 cursor-default"
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Datos de Envío y Pago
            </h3>
            <p className="text-[11px] text-slate-500">
              Ingresa tu información para completar la compra
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
              Paso 2 de 4
            </span>
            <button
              type="button"
              onClick={handleClose}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 font-bold flex items-center justify-center text-xs transition-colors"
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
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
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs pr-16 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            <div className="absolute right-2 top-2.5 flex items-center h-5">
              {brand === "VISA" && (
                <img src="/images/cards/visa.png" alt="Visa" className="h-4 object-contain" />
              )}
              {brand === "MASTERCARD" && (
                <img src="/images/cards/mastercard.png" alt="Mastercard" className="h-5 object-contain" />
              )}
              {brand !== "VISA" && brand !== "MASTERCARD" && (
                <span className="text-[10px] font-bold text-slate-400">TARJETA</span>
              )}
            </div>
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
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
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