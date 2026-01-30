import { RpcClient, HttpHandler, PublicKey } from 'casper-js-sdk';

export interface TransactionVerification {
  valid: boolean;
  deployHash: string;
  amount?: number; // in motes
  recipient?: string;
  sender?: string;
  blockHeight?: number;
  timestamp?: string;
  error?: string;
}

const NOWNODES_RPC_URL_MAINNET = process.env.NEXT_PUBLIC_RPC_URL_MAINNET!;
const CSPR_CLOUD_RPC_URL_TESTNET = process.env.NEXT_PUBLIC_RPC_URL!;
const NOWNODES_API_KEY = process.env.NOWNODES_API_KEY;
const FALLBACK_RPC_URL_TESTNET = process.env.FALLBACK_RPC_URL_TESTNET || 'https://node.testnet.cspr.cloud/rpc';
const FALLBACK_RPC_URL_MAINNET = process.env.FALLBACK_RPC_URL_MAINNET || 'https://node.mainnet.cspr.cloud/rpc';
const CSPR_CLOUD_API_KEY = process.env.CSPR_CLOUD_API_KEY;

function publicKeyToAccountHash(publicKeyHex: string): string {
  try {
    const pk = PublicKey.fromHex(publicKeyHex);
    const accountHashObj = pk.accountHash();
    const hashBytes = (accountHashObj as any).hashBytes as Uint8Array;
    return Array.from(hashBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    console.error('[publicKeyToAccountHash] Error:', e);
    return '';
  }
}

function extractAccountHash(value: any): string {
  if (!value) return '';

  if (typeof value === 'string') {
    return value.replace('account-hash-', '').toLowerCase();
  }
  
  if (value.hashBytes && value.hashBytes instanceof Uint8Array) {
    return Array.from(value.hashBytes as Uint8Array).map(b => (b as number).toString(16).padStart(2, '0')).join('');
  }
  
  if (value.AccountHash) {
    return extractAccountHash(value.AccountHash);
  }
  
  return '';
}

function getCasperClient(network: 'testnet' | 'mainnet' = 'testnet'): RpcClient {
  const isMainnet = network === 'mainnet';
  const primaryUrl = isMainnet ? NOWNODES_RPC_URL_MAINNET : CSPR_CLOUD_RPC_URL_TESTNET;
  const handler = new HttpHandler(primaryUrl);
  
  if (isMainnet && NOWNODES_API_KEY) {
    handler.setCustomHeaders({
      'api-key': NOWNODES_API_KEY
    });
  } else if (!isMainnet && CSPR_CLOUD_API_KEY) {
    handler.setCustomHeaders({
      'Authorization': CSPR_CLOUD_API_KEY
    });
  }
  
  return new RpcClient(handler);
}

function getFallbackClient(network: 'testnet' | 'mainnet' = 'testnet'): RpcClient {
  const isMainnet = network === 'mainnet';
  const fallbackUrl = isMainnet ? FALLBACK_RPC_URL_MAINNET : FALLBACK_RPC_URL_TESTNET;
  const handler = new HttpHandler(fallbackUrl);
  
  if (CSPR_CLOUD_API_KEY) {
    handler.setCustomHeaders({
      'Authorization': CSPR_CLOUD_API_KEY
    });
  }
  
  return new RpcClient(handler);
}

export async function verifyTransaction(
  deployHash: string,
  expectedRecipient: string,
  expectedAmount: number,
  senderAddress?: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<TransactionVerification> {

  try {
    const client = getCasperClient(network);
    let result;
    
    try {
      result = await client.getDeploy(deployHash);
    } catch (primaryError: any) {
      console.warn(`[verifyTransaction] Primary RPC failed for ${network}, trying fallback...`, primaryError.message);
      const fallback = getFallbackClient(network);
      result = await fallback.getDeploy(deployHash);
    }
    
    const { deploy } = result;
    const executionResult = result.executionResultsV1?.[0] 
      || (result as any).executionResults?.[0]
      || (result as any).executionInfo?.executionResult;

    if (!deploy || !executionResult) {
      return {
        valid: false,
        deployHash,
        error: 'Transaction not found or execution results missing'
      };
    }

    const isSuccess = executionResult.result 
      ? 'Success' in executionResult.result 
      : executionResult.transfers && executionResult.transfers.length > 0;
    if (!isSuccess) {
      return {
        valid: false,
        deployHash,
        error: 'Transaction failed on blockchain'
      };
    }

    let transferAmount = 0;
    let transferRecipient = '';
    let sender = '';

    if (!executionResult.transfers || executionResult.transfers.length === 0) {
      return {
        valid: false,
        deployHash,
        error: 'No transfer found in transaction'
      };
    }

    const transfer = executionResult.transfers[0];
    transferAmount = Number(transfer.amount || 0);
    transferRecipient = extractAccountHash(transfer.to);
    sender = extractAccountHash(transfer.from);
    
    if (!sender) {
      const account = deploy.header.account;
      sender = typeof account === 'string' ? account : account?.toHex?.() || '';
    }

    const expectedAccountHash = publicKeyToAccountHash(expectedRecipient);
    const recipientAccountHash = transferRecipient.toLowerCase();
    
    const recipientMatch = recipientAccountHash === expectedAccountHash;
    if (!recipientMatch) {
      return {
        valid: false,
        deployHash,
        error: `Recipient mismatch. Expected: ${expectedRecipient}, Got: ${transferRecipient}`
      };
    }

    // Validate amount (convert CSPR to motes: 1 CSPR = 1e9 motes)
    const expectedAmountMotes = Math.floor(expectedAmount * 1e9);
    if (transferAmount < expectedAmountMotes) {
      return {
        valid: false,
        deployHash,
        error: `Amount mismatch. Expected: ${expectedAmountMotes} motes, Got: ${transferAmount} motes`
      };
    }

    return {
      valid: true,
      deployHash,
      amount: transferAmount,
      recipient: transferRecipient,
      sender,
      blockHeight: executionResult.blockHash ? undefined : undefined, 
      timestamp: deploy.header.timestamp.date.toISOString()
    };

  } catch (error: any) {
    console.error('[verifyTransaction] Error:', error);
    return {
      valid: false,
      deployHash,
      error: error.message || 'Transaction verification failed'
    };
  }
}

export async function checkTransactionProcessed(
  deployHash: string,
  supabase: any
): Promise<boolean> {
  const { data, error } = await supabase
    .from('payments')
    .select('id')
    .eq('transaction_hash', deployHash)
    .limit(1);

  if (error) {
    console.error('[checkTransactionProcessed] Error:', error);
    return false;
  }

  return data && data.length > 0;
}
