// src/api/checkoutApi.ts
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

export const checkoutApi = {
  /**
   * Obtiene la lista de productos y unidades en stock
   */
  getProducts: async (): Promise<Product[]> => {
    const response = await axiosClient.get<Product[]>('/products');
    return response.data;
  },

  /**
   * Crea una transacción en estado PENDING en la base de datos
   */
  createTransaction: async (payload: CreateTransactionPayload): Promise<Transaction> => {
    const response = await axiosClient.post<Transaction>('/transactions', payload);
    return response.data;
  },

  /**
   * Procesa el pago llamando a la API  desde el backend
   */
  processPayment: async (payload: ProcessPaymentPayload): Promise<Transaction> => {
    const response = await axiosClient.post<Transaction>(
      `/transactions/${payload.transactionId}/process`,
      { cardData: payload.cardData }
    );
    return response.data;
  },
};