import { RpcClient, HttpHandler } from 'casper-js-sdk';

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
    const executionResult = result.executionResultsV1?.[0];

    if (!deploy || !executionResult) {
      return {
        valid: false,
        deployHash,
        error: 'Transaction not found or execution results missing'
      };
    }

    const isSuccess = executionResult.result && 'Success' in executionResult.result;
    if (!isSuccess) {
      return {
        valid: false,
        deployHash,
        error: 'Transaction failed on blockchain'
      };
    }

    const { session } = deploy;
    
    let transferAmount = 0;
    let transferRecipient = '';
    let sender = '';

    if (session.transfer) {
      const { transfer } = session;
      transferAmount = Number(transfer.args.getByName('amount')?.ui512?.getValue() || 0);
      transferRecipient = transfer.args.getByName('target')?.key?.toPrefixedString() || '';
      sender = deploy.header.account?.toHex() || '';
    } else if (session.storedContractByHash || session.storedContractByName) {
 
      return {
        valid: false,
        deployHash,
        error: 'CEP-18 token transfers not yet supported'
      };
    } else {
      return {
        valid: false,
        deployHash,
        error: 'Unsupported transaction type'
      };
    }

    const recipientMatch = transferRecipient.toLowerCase() === expectedRecipient.toLowerCase();
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
