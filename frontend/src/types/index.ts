// src/types/index.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface CustomerData {
  fullName: string;
  email: string;
  phone: string;
}

export interface DeliveryData {
  address: string;
  city: string;
  region: string;
}

export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

export interface CardData {
  number: string;
  cardHolder: string;
  expDate: string; // Formato MM/YY
  cvc: string;
  cardType: CardBrand;
}

export type TransactionStatus = 'IDLE' | 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface Transaction {
  id: string;
  reference: string;
  productId: string;
  quantity: number;
  amount: number;
  baseFee: number;
  deliveryFee: number;
  status: TransactionStatus;
  customerData: CustomerData;
  deliveryData: DeliveryData;
  createdAt: string;
}