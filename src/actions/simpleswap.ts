'use server';

import type {
  SimpleSwapEstimate,
  SimpleSwapRange,
  SimpleSwapExchange,
  CreateExchangeInput,
} from 'src/types/simpleswap';

const SIMPLESWAP_API_URL = process.env.NEXT_PUBLIC_SIMPLESWAP_API_URL!;
const SIMPLESWAP_API_KEY = process.env.SIMPLESWAP_API_KEY!;

async function simpleswapFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const url = `${SIMPLESWAP_API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SIMPLESWAP_API_KEY,
        ...options.headers,
      },
    });

    const responseText = await response.text();
    const responseJson = responseText ? JSON.parse(responseText) : null;

    if (!response.ok) {
      console.error('[SimpleSwap] API Error:', responseJson);
      return {
        success: false,
        error: responseJson?.message || `API Error: ${response.status}`,
      };
    }

    const data = responseJson?.result || responseJson;
    
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      console.error('[SimpleSwap] Empty response data');
      return { success: false, error: 'Empty response from API' };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('[SimpleSwap] Fetch Error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

export async function getEstimate(
  tickerFrom: string,
  tickerTo: string,
  networkFrom: string,
  networkTo: string,
  amount: string,
  fixed: boolean = false
): Promise<{ success: boolean; data?: SimpleSwapEstimate; error?: string }> {
  const numAmount = parseFloat(amount);
  if (Number.isNaN(numAmount) || numAmount <= 0) {
    return { success: false, error: 'Amount must be a positive number' };
  }
  
  const endpoint = `/estimates?fixed=${fixed}&tickerFrom=${tickerFrom}&tickerTo=${tickerTo}&networkFrom=${networkFrom}&networkTo=${networkTo}&amount=${amount}`;
  return simpleswapFetch<SimpleSwapEstimate>(endpoint);
}

export async function getRange(
  tickerFrom: string,
  tickerTo: string,
  networkFrom: string,
  networkTo: string,
  fixed: boolean = false
): Promise<{ success: boolean; data?: SimpleSwapRange; error?: string }> {
  const endpoint = `/ranges?fixed=${fixed}&tickerFrom=${tickerFrom}&tickerTo=${tickerTo}&networkFrom=${networkFrom}&networkTo=${networkTo}`;
  return simpleswapFetch<SimpleSwapRange>(endpoint);
}

export async function createExchange(
  input: CreateExchangeInput
): Promise<{ success: boolean; data?: SimpleSwapExchange; error?: string }> {
  const rangeCheck = await getRange(input.ticker_from, input.ticker_to, input.network_from, input.network_to, input.fixed);
  
  if (!rangeCheck.success || !rangeCheck.data) {
    return { success: false, error: 'Failed to verify exchange range' };
  }

  const minAmount = parseFloat(rangeCheck.data.min);
  const maxAmount = rangeCheck.data.max ? parseFloat(rangeCheck.data.max) : null;
  const inputAmount = parseFloat(input.amount);

  console.log('[SimpleSwap] Exchange validation:', {
    inputAmount,
    minAmount,
    maxAmount,
    isAboveMin: inputAmount >= minAmount,
    isBelowMax: maxAmount ? inputAmount <= maxAmount : true,
  });

  if (inputAmount < minAmount) {
    return { success: false, error: `Amount ${inputAmount} is below minimum ${minAmount}` };
  }

  if (maxAmount && inputAmount > maxAmount) {
    return { success: false, error: `Amount ${inputAmount} is above maximum ${maxAmount}` };
  }

  const body: any = {
    fixed: input.fixed,
    tickerFrom: input.ticker_from,
    tickerTo: input.ticker_to,
    networkFrom: input.network_from,
    networkTo: input.network_to,
    amount: input.amount,
    addressTo: input.address_to,
  };

  if (input.extra_id_to) {
    body.extraIdTo = input.extra_id_to;
  }

  if (input.user_refund_address) {
    body.userRefundAddress = input.user_refund_address;
  }

  if (input.user_refund_extra_id) {
    body.userRefundExtraId = input.user_refund_extra_id;
  }

  console.log('[SimpleSwap] Creating exchange with params:', JSON.stringify(body, null, 2));

  return simpleswapFetch<SimpleSwapExchange>('/exchanges', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getExchangeStatus(
  exchangeId: string
): Promise<{ success: boolean; data?: SimpleSwapExchange; error?: string }> {
  return simpleswapFetch<SimpleSwapExchange>(`/exchanges/${exchangeId}`);
}

export async function checkCsprPairAvailable(
  tickerFrom: string,
  networkFrom: string
): Promise<{ success: boolean; available: boolean; error?: string }> {
  const result = await getRange(tickerFrom, 'cspr', networkFrom, 'cspr', false);
  
  if (result.success && result.data) {
    return { success: true, available: true };
  }
  
  return { success: true, available: false, error: result.error };
}

export async function calculateRequiredAmount(
  tickerFrom: string,
  networkFrom: string,
  targetCsprAmount: number,
  fixed: boolean = false
): Promise<{ success: boolean; data?: { amount: string; rate: string; minAmount: string }; error?: string }> {
  const rangeResult = await getRange(tickerFrom, 'cspr', networkFrom, 'cspr', fixed);
  
  if (!rangeResult.success || !rangeResult.data) {
    return { success: false, error: rangeResult.error || 'Failed to get range' };
  }
  
  const minAmount = parseFloat(rangeResult.data.min);
  const safeMinAmount = minAmount * 1.005;

  const testAmount = Math.max(safeMinAmount, 1).toFixed(8);
  const estimate = await getEstimate(tickerFrom, 'cspr', networkFrom, 'cspr', testAmount, fixed);
  
  if (!estimate.success || !estimate.data) {
    return { success: false, error: estimate.error || 'Failed to get estimate' };
  }
  
  const csprPerUnit = parseFloat(estimate.data.estimatedAmount) / parseFloat(testAmount);
  if (csprPerUnit <= 0 || Number.isNaN(csprPerUnit)) {
    return { success: false, error: 'Invalid rate' };
  }
  
  let requiredAmount = targetCsprAmount / csprPerUnit;
  
  if (requiredAmount < safeMinAmount) {
    requiredAmount = safeMinAmount;
  }
  
  return {
    success: true,
    data: {
      amount: requiredAmount.toFixed(8),
      rate: csprPerUnit.toFixed(4),
      minAmount: safeMinAmount.toFixed(8),
    },
  };
}
