// src/api/checkoutApi.ts
import axios from 'axios';
import axiosClient from './axiosClient';
import type { Product, CustomerData, DeliveryData, CardData, Transaction } from '../types';

export interface CreateTransactionPayload {
  productId: string;
  quantity: number;
  customerData: CustomerData;
  deliveryData: DeliveryData;
}

export interface ProcessPaymentPayload {
  transactionId: string;
  cardData: CardData;
}

// Lectura dinámica desde las variables de entorno
const WOMPI_API_URL = import.meta.env.VITE_WOMPI_API_URL;
const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY;

export const checkoutApi = {
  getProducts: async (): Promise<Product[]> => {
    const response = await axiosClient.get('/products');
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  /**
   * Crea la transacción inicial en estado PENDING adaptada al DTO del backend
   */
  createTransaction: async (payload: CreateTransactionPayload): Promise<Transaction> => {
    const formattedPayload = {
      productId: payload.productId,
      quantity: payload.quantity,
      customerData: {
        name: payload.customerData.fullName,
        email: payload.customerData.email,
      },
      deliveryData: {
        address: payload.deliveryData.address,
        city: payload.deliveryData.city,
        phone: payload.customerData.phone,
      },
    };

    const response = await axiosClient.post('/transactions', formattedPayload);
    return response.data?.data || response.data;
  },

  /**
   * Tokeniza la tarjeta con Wompi Sandbox y procesa la transacción en el backend
   */
  processPayment: async (payload: ProcessPaymentPayload): Promise<Transaction> => {
    if (!WOMPI_API_URL || !WOMPI_PUBLIC_KEY) {
      throw new Error('Variables de entorno de Wompi no configuradas.');
    }

    // Formatear mes (2 dígitos) y año (2 dígitos)
    const [expMonthRaw, expYearRaw] = payload.cardData.expDate.split('/');
    const expMonth = expMonthRaw.padStart(2, '0');
    const expYear = expYearRaw.length === 4 ? expYearRaw.slice(-2) : expYearRaw;

    // 1. Tokenizar la tarjeta con la API Sandbox de Wompi
    const wompiResponse = await axios.post(
      `${WOMPI_API_URL}/tokens/cards`,
      {
        number: payload.cardData.number.replace(/\s/g, ''),
        cvc: payload.cardData.cvc,
        exp_month: expMonth,
        exp_year: expYear,
        card_holder: payload.cardData.cardHolder,
      },
      {
        headers: {
          Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`,
        },
      }
    );

    const cardToken = wompiResponse.data?.data?.id || wompiResponse.data?.id;

    // 2. Enviar únicamente { cardToken } al endpoint de procesamiento del backend
    const response = await axiosClient.post(
      `/transactions/${payload.transactionId}/process`,
      { cardToken }
    );

    return response.data?.data || response.data;
  },
};