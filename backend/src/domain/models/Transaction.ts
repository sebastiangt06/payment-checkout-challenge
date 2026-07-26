import {TransactionStatus} from './TransactionStatus';
import {CustomerData} from './CustomerData';
import {DeliveryData} from './DeliveryData';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly reference: string,
    public readonly productId: string,
    public readonly amount: number,
    public readonly baseFee: number,
    public readonly deliveryFee: number,
    public status: TransactionStatus,
    public readonly customerData: CustomerData,
    public readonly deliveryData: DeliveryData,
    public readonly createdAt: string = new Date().toISOString(),
  ) {}
}