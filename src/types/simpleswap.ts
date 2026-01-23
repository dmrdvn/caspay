export interface SimpleSwapCurrency {
  ticker: string;
  network: string;
  name: string;
  image: string;
  has_extra_id: boolean;
  extra_id_name?: string;
  is_fiat: boolean;
}

export interface SimpleSwapEstimate {
  estimatedAmount: string;
  rateId: string | null;
  validUntil: string | null;
}

export interface SimpleSwapRange {
  min: string;
  max: string | null;
}

export interface SimpleSwapExchange {
  id: string;
  type: string;
  status: string;
  timestamp: string;
  currencyFrom: string;
  currencyTo: string;
  networkFrom: string;
  networkTo: string;
  amountFrom: string;
  amountTo: string;
  expectedAmount?: string;
  addressFrom: string;
  addressTo: string;
  extraIdFrom: string | null;
  extraIdTo: string | null;
  txFrom: string | null;
  txTo: string | null;
  redirectUrl: string | null;
}

export type SimpleSwapStatus =
  | 'waiting'
  | 'confirming'
  | 'exchanging'
  | 'sending'
  | 'finished'
  | 'failed'
  | 'refunded'
  | 'expired';

export interface CreateExchangeInput {
  fixed: boolean;
  ticker_from: string;
  ticker_to: string;
  network_from: string;
  network_to: string;
  amount: string;
  address_to: string;
  extra_id_to?: string;
  user_refund_address?: string;
  user_refund_extra_id?: string;
}

export interface PopularCurrency {
  ticker: string;
  network: string;
  name: string;
  icon: string;
}

export const POPULAR_CURRENCIES: PopularCurrency[] = [
  { ticker: 'btc', network: 'btc', name: 'Bitcoin', icon: 'cryptocurrency-color:btc' },
  { ticker: 'eth', network: 'eth', name: 'Ethereum', icon: 'cryptocurrency-color:eth' },
  { ticker: 'usdt', network: 'eth', name: 'USDT (ERC20)', icon: 'cryptocurrency-color:usdt' },
  { ticker: 'usdt', network: 'trx', name: 'USDT (TRC20)', icon: 'cryptocurrency-color:usdt' },
  { ticker: 'usdc', network: 'eth', name: 'USDC (ERC20)', icon: 'cryptocurrency-color:usdc' },
  { ticker: 'bnb-bsc', network: 'bsc', name: 'BNB', icon: 'cryptocurrency-color:bnb' },
  { ticker: 'sol', network: 'sol', name: 'Solana', icon: 'cryptocurrency-color:sol' },
  { ticker: 'pol', network: 'matic', name: 'Polygon', icon: 'cryptocurrency-color:matic' },
  { ticker: 'trx', network: 'trx', name: 'Tron', icon: 'cryptocurrency-color:trx' },
  { ticker: 'ltc', network: 'ltc', name: 'Litecoin', icon: 'cryptocurrency-color:ltc' },
];
