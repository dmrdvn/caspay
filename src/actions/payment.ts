'use server';

import type {
  RecordPayLinkPaymentInput,
  CreatePendingPaymentInput,
  PaymentStatusResponse,
  ActionResponse,
} from 'src/types/payment';

import { supabase } from 'src/lib/supabase';
import { generatePaymentId } from 'src/utils/generate-payment-id';

export async function recordPayLinkPayment(input: RecordPayLinkPaymentInput): Promise<void> {
  try {
    const { data: paylink, error: paylinkError } = await supabase
      .from('paylinks')
      .select('*, product:products(*), merchant:merchants(*)')
      .eq('id', input.paylinkId)
      .single();

    if (paylinkError || !paylink) {
      throw new Error('PayLink not found');
    }

    const { error: paymentError } = await supabase.from('payments').insert({
      merchant_id: paylink.merchant_id,
      transaction_hash: input.transactionHash,
      payer_address: input.payerAddress,
      product_id: paylink.product_id,
      paylink_id: input.paylinkId,
      amount: input.amount,
      token: input.currency,
      decimals: 9,
      status: 'pending',
      payment_type: 'one_time',
      payment_source: input.paymentMethod,
    });

    if (paymentError) {
      console.error('[recordPayLinkPayment] Payment insert error:', paymentError);
      throw new Error(paymentError.message);
    }

    const { error: usageError } = await supabase.rpc('increment_paylink_usage', {
      paylink_id: input.paylinkId,
    });

    if (usageError) {
      console.error('[recordPayLinkPayment] Usage increment error:', usageError);
    }

    const { error: analyticsError } = await supabase.from('paylink_analytics').insert({
      paylink_id: input.paylinkId,
      event_type: 'payment_completed',
      payment_method: input.paymentMethod === 'paylink_wallet' ? 'wallet' : 'fiat',
    });

    if (analyticsError) {
      console.error('[recordPayLinkPayment] Analytics error:', analyticsError);
    }
  } catch (error: any) {
    console.error('[recordPayLinkPayment] Error:', error);
    throw error;
  }
}

export async function createPendingPayment(
  input: CreatePendingPaymentInput
): Promise<
  ActionResponse<{
    paymentId: string;
    uniqueCode: number;
  }>
> {
  try {
    const { data: paylink } = await supabase
      .from('paylinks')
      .select('network')
      .eq('id', input.paylinkId)
      .single();

    const network = paylink?.network || 'testnet';

    let uniquePaymentId: number;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      uniquePaymentId = generatePaymentId();

      const { data: existing } = await supabase
        .from('payments')
        .select('id')
        .eq('status', 'pending')
        .contains('metadata', { unique_payment_id: uniquePaymentId.toString() })
        .maybeSingle();

      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return { success: false, error: 'Failed to generate unique payment ID' };
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        merchant_id: input.merchantId,
        paylink_id: input.paylinkId,
        product_id: input.productId,
        status: 'pending',
        amount: input.amount,
        token: input.currency,
        payer_address: '',
        transaction_hash: `pending-${uniquePaymentId!}`,
        payment_source: 'paylink_wallet',
        payment_type: 'product',
        block_timestamp: new Date().toISOString(),
        metadata: {
          unique_payment_id: uniquePaymentId!.toString(),
          expected_recipient: input.walletAddress,
          expires_at: expiresAt,
          network,
        },
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        paymentId: payment.id,
        uniqueCode: uniquePaymentId!,
      },
    };
  } catch (err: any) {
    console.error('[createPendingPayment] Error:', err);
    return { success: false, error: err.message };
  }
}

export async function checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
  const { data: payment } = await supabase
    .from('payments')
    .select('status, transaction_hash, metadata')
    .eq('id', paymentId)
    .single();

  return {
    status: payment?.status || 'unknown',
    transactionHash: payment?.transaction_hash,
    metadata: payment?.metadata,
  };
}

export async function cancelPendingPayment(paymentId: string): Promise<ActionResponse> {
  try {
    const { supabaseAdmin } = await import('src/lib/supabase');
    
    const { error } = await supabaseAdmin
      .from('payments')
      .delete()
      .eq('id', paymentId)
      .eq('status', 'pending');

    if (error) {
      console.error('[cancelPendingPayment] Delete error:', error);
      return { success: false, error: error.message };
    }

    console.log(`[cancelPendingPayment] Payment ${paymentId} cancelled successfully`);
    return { success: true };
  } catch (err: any) {
    console.error('[cancelPendingPayment] Exception:', err);
    return { success: false, error: err.message };
  }
}

export async function recordBridgePayment(input: {
  paylinkId: string;
  merchantId: string;
  productId: string;
  amount: number;
  currency: string;
  exchangeId: string;
  csprTxHash: string | null;
  fromCurrency: string;
  fromAmount: string;
  fromAddress: string;
}): Promise<ActionResponse<{ paymentId: string }>> {
  try {
    const { data: paylink } = await supabase
      .from('paylinks')
      .select('network')
      .eq('id', input.paylinkId)
      .single();

    const network = paylink?.network || 'mainnet';
 
    const paymentData = {
      merchant_id: input.merchantId,
      paylink_id: input.paylinkId,
      product_id: input.productId,
      status: input.csprTxHash ? 'confirmed' : 'pending',
      amount: input.amount,
      token: input.currency,
      payer_address: input.fromAddress,
      transaction_hash: input.csprTxHash || `bridge-${input.exchangeId}`,
      payment_source: 'paylink_bridge',
      payment_type: 'product',
      block_timestamp: new Date().toISOString(),
      metadata: {
        exchange_id: input.exchangeId,
        from_currency: input.fromCurrency,
        from_amount: input.fromAmount,
        from_address: input.fromAddress,
        network,
      },
    };

    const { data: payment, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) {
      console.error('[recordBridgePayment] ❌ Insert error:', error);
      return { success: false, error: error.message };
    }

    const { error: usageError } = await supabase.rpc('increment_paylink_usage', {
      paylink_id: input.paylinkId,
    });

    if (usageError) {
      console.error('[recordBridgePayment] Usage increment error:', usageError);
    } else {
      console.log('[recordBridgePayment] PayLink usage incremented');
    }

    console.log('[recordBridgePayment] 📊 Recording analytics...');
    const { error: analyticsError } = await supabase.from('paylink_analytics').insert({
      paylink_id: input.paylinkId,
      event_type: 'payment_completed',
      payment_method: 'bridge',
    });

    if (analyticsError) {
      console.error('[recordBridgePayment] Analytics error:', analyticsError);
    } else {
      console.log('[recordBridgePayment] Analytics recorded');
    }

    console.log('[recordBridgePayment] Bridge payment recorded successfully! Payment ID:', payment.id);

    return {
      success: true,
      data: { paymentId: payment.id },
    };
  } catch (err: any) {
    console.error('[recordBridgePayment] Exception:', err);
    return { success: false, error: err.message };
  }
}

export async function verifyPendingPayments(): Promise<{
  success: boolean;
  summary?: {
    total: number;
    confirmed: number;
    expired: number;
    pending: number;
    errors: number;
  };
  error?: string;
}> {
  try {
    const { supabaseAdmin } = await import('src/lib/supabase');
    
    console.log('[verifyPendingPayments] Fetching pending payments...');
    
    const { data: pendingPayments, error } = await supabaseAdmin
      .from('payments')
      .select('*, paylink:paylinks(network)')
      .eq('status', 'pending')
      .eq('payment_source', 'paylink_wallet')
      .not('metadata->expires_at', 'is', null);

    if (error) throw error;

    if (!pendingPayments || pendingPayments.length === 0) {
      console.log('[verifyPendingPayments] No pending payments found');
      return {
        success: true,
        summary: { total: 0, confirmed: 0, expired: 0, pending: 0, errors: 0 },
      };
    }

    console.log(`[verifyPendingPayments] Found ${pendingPayments.length} pending payments`);

    const results = await Promise.allSettled(
      pendingPayments.map(async (payment) => {
        const metadata = payment.metadata as any;
        const expiresAt = new Date(metadata.expires_at);
        const now = new Date();
        
        const network = (payment.paylink as any)?.network || 'testnet';

        if (now > expiresAt) {
          console.log(`[verifyPendingPayments] Payment ${payment.id} expired`);
          await supabaseAdmin
            .from('payments')
            .update({ status: 'failed', metadata: { ...metadata, failure_reason: 'timeout' } })
            .eq('id', payment.id);
          return { id: payment.id, result: 'expired' };
        }

        const uniqueId = metadata.unique_payment_id;
        const expectedRecipient = metadata.expected_recipient;
        const expectedAmount = payment.amount;

        const searchResult = await searchTransferByMemo(
          uniqueId,
          expectedRecipient,
          expectedAmount,
          payment.created_at,
          network
        );

        if (searchResult.found && searchResult.transfers) {
        
          const existingHashes = (metadata.partial_payments || []).map((p: any) => p.hash);
          const newTransfers = searchResult.transfers.filter(
            (t) => !existingHashes.includes(t.hash)
          );

       
          if (newTransfers.length === 0) {
            console.log(`[verifyPendingPayments] No new transfers, payment ${payment.id} remains pending`);
            return { id: payment.id, result: 'pending' };
          }

          const allTransfers = [...(metadata.partial_payments || []), ...newTransfers];
          const totalReceived = allTransfers.reduce((sum: number, t: any) => sum + t.amount, 0);

          console.log(`[verifyPendingPayments] 💰 Total received: ${totalReceived} CSPR / Expected: ${expectedAmount} CSPR`);

          if (totalReceived >= expectedAmount) {
            const latestTransfer = newTransfers[newTransfers.length - 1];


            const { error: updateError } = await supabaseAdmin
              .from('payments')
              .update({
                status: 'confirmed',
                transaction_hash: latestTransfer.hash,
                payer_address: latestTransfer.sender,
                block_height: latestTransfer.blockHeight,
                block_timestamp: latestTransfer.timestamp,
                metadata: {
                  ...metadata,
                  partial_payments: allTransfers,
                  total_received: totalReceived,
                  overpayment:
                    totalReceived > expectedAmount ? totalReceived - expectedAmount : 0,
                },
              })
              .eq('id', payment.id)
              .eq('status', 'pending');

            if (updateError) {

              throw updateError;
            }

     
            const { error: rpcError } = await supabaseAdmin.rpc('increment_paylink_usage', {
              paylink_id: payment.paylink_id,
            });

            if (rpcError) {
              console.error(`[verifyPendingPayments] Failed to increment PayLink usage:`, rpcError);
            } else {
              console.log(`[verifyPendingPayments] PayLink usage incremented successfully`);
            }

            return { id: payment.id, result: 'confirmed' };
          } else {
            const latestTransfer = newTransfers[newTransfers.length - 1];

        
            const { error: updateError } = await supabaseAdmin.from('payments').update({
              transaction_hash: latestTransfer.hash,
              payer_address: latestTransfer.sender,
              block_height: latestTransfer.blockHeight,
              block_timestamp: latestTransfer.timestamp,
              metadata: {
                ...metadata,
                partial_payments: allTransfers,
                total_received: totalReceived,
                payment_status: 'partial',
              },
            }).eq('id', payment.id);

            if (updateError) {
              console.error(`[verifyPendingPayments] Partial payment update failed:`, updateError);
            } else {
              console.log(`[verifyPendingPayments] Partial payment info saved to Supabase`);
            }

            return { id: payment.id, result: 'partial' };
          }
        }

        console.log(`[verifyPendingPayments] ⏳ No matching transfers found yet for payment ${payment.id}`);
        return { id: payment.id, result: 'pending' };
      })
    );

    const summary = {
      total: pendingPayments.length,
      confirmed: results.filter((r) => r.status === 'fulfilled' && (r.value as any).result === 'confirmed').length,
      expired: results.filter((r) => r.status === 'fulfilled' && (r.value as any).result === 'expired').length,
      pending: results.filter((r) => r.status === 'fulfilled' && (r.value as any).result === 'pending').length,
      errors: results.filter((r) => r.status === 'rejected').length,
    };

    console.log('[verifyPendingPayments] Summary:', summary);

    return { success: true, summary };
  } catch (err: any) {
    console.error('[verifyPendingPayments] Error:', err);
    return { success: false, error: err.message };
  }
}

async function searchTransferByMemo(
  uniqueId: string,
  recipientAddress: string,
  expectedAmount: number,
  createdAt: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{
  found: boolean;
  transfers?: Array<{
    amount: number;
    hash: string;
    sender: string;
    blockHeight: number;
    timestamp: string;
  }>;
}> {
  try {
    const apiKey = process.env.CSPR_CLOUD_API_KEY || '';

    const paymentCreated = new Date(createdAt);
    const searchFromTime = new Date(paymentCreated.getTime() - 5 * 60 * 1000);

    const apiBaseUrl = network === 'mainnet' 
      ? 'https://api.cspr.cloud'
      : 'https://api.testnet.cspr.cloud';

    console.log(`[searchTransferByMemo] 🔍 Searching on ${network.toUpperCase()} for transfer ID: ${uniqueId} to ${recipientAddress.slice(0, 10)}...`);
    console.log(`[searchTransferByMemo] Search parameters:`, {
      uniqueId,
      recipientAddress: recipientAddress.slice(0, 20) + '...',
      expectedAmount,
      searchFromTime: searchFromTime.toISOString(),
    });

    const response = await fetch(
      `${apiBaseUrl}/accounts/${recipientAddress}/transfers?page_size=20&page_number=1&order_by=timestamp&order_direction=DESC`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      return { found: false };
    }

    console.log(`[searchTransferByMemo] ✅ API response received successfully`);

    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (err) {
      console.error(`[searchTransferByMemo] ❌ Failed to parse JSON response`);
      console.error(`[searchTransferByMemo] Response body:`, responseText.slice(0, 500));
      return { found: false };
    }
    const transfers = data.data || [];

   
    const recentTransfers = transfers.filter((t: any) => {
      const transferTime = new Date(t.timestamp);
      return transferTime >= searchFromTime;
    });

    
    const matchingTransfers: Array<{
      amount: number;
      hash: string;
      sender: string;
      blockHeight: number;
      timestamp: string;
    }> = [];

   
    for (const transfer of recentTransfers) {
      if (transfer.id && transfer.id.toString() === uniqueId) {
        const amountInCSPR = parseFloat(transfer.amount) / 1_000_000_000;


        if (amountInCSPR > 0) {
          matchingTransfers.push({
            amount: amountInCSPR,
            hash: transfer.deploy_hash,
            sender: transfer.initiator_account_hash || '',
            blockHeight: transfer.block_height,
            timestamp: transfer.timestamp,
          });
          
        } else {
          console.log(`[searchTransferByMemo] ⚠️ Transfer amount is 0, skipping...`);
        }
      }
    }

    if (matchingTransfers.length > 0) {
      return { found: true, transfers: matchingTransfers };
    }

    return { found: false };
  } catch (err) {
    console.error('[searchTransferByMemo] ❌ Exception occurred:', err);
    return { found: false };
  }
}
