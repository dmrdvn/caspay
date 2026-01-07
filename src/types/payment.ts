
export type RecordPayLinkPaymentInput = {
  paylinkId: string;
  transactionHash: string;
  payerAddress: string;
  amount: number;
  currency: string;
  paymentMethod: 'paylink_wallet' | 'paylink_fiat';
};

export type CreatePendingPaymentInput = {
  paylinkId: string;
  merchantId: string;
  productId: string;
  amount: number;
  currency: string;
  walletAddress: string;
};

export type PaymentStatusResponse = {
  status: string;
  transactionHash?: string;
  metadata?: any;
};

export type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};
