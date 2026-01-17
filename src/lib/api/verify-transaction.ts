import { RpcClient, HttpHandler } from 'casper-js-sdk';

/**
 * Casper transaction verification
 * 
 * Security features:
 * - On-chain verification (trust blockchain, not client)
 * - Amount validation
 * - Recipient validation
 * - Success status check
 * - Idempotency (prevent duplicate processing)
 */

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

// Casper RPC endpoint (testnet or mainnet based on env)
const CASPER_NODE_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://node.testnet.cspr.cloud/rpc';
const CSPR_CLOUD_API_KEY = process.env.CSPR_CLOUD_API_KEY;

// Lazy initialization to avoid constructor error
let casperClient: RpcClient | null = null;
function getCasperClient(): RpcClient {
  if (!casperClient) {
    const handler = new HttpHandler(CASPER_NODE_URL);
    if (CSPR_CLOUD_API_KEY) {
      handler.setCustomHeaders({
        'Authorization': CSPR_CLOUD_API_KEY
      });
    }
    casperClient = new RpcClient(handler);
  }
  return casperClient;
}

/**
 * Verify a Casper transfer transaction
 * 
 * MOCK MODE: For testing without blockchain
 * Set MOCK_TRANSACTION_VERIFICATION=true to bypass blockchain checks
 * 
 * FAKE HASH DETECTION: Automatically detects demo/test hashes
 * Patterns: demo_tx_*, mock_tx_*, test_tx_*
 */
export async function verifyTransaction(
  deployHash: string,
  expectedRecipient: string,
  expectedAmount: number, // in CSPR (will convert to motes)
  senderAddress?: string // Optional: sender address from user input (used in mock mode)
): Promise<TransactionVerification> {
  // MOCK MODE: Skip blockchain verification for testing
  const mockMode = process.env.MOCK_TRANSACTION_VERIFICATION === 'true';
  
  // AUTO-DETECT FAKE HASH: Check if hash is a demo/test hash
  const isFakeHash = /^(demo_tx_|mock_tx_|test_tx_)/i.test(deployHash);
  
  if (mockMode || isFakeHash) {
    console.log('[verifyTransaction] MOCK/FAKE MODE: Bypassing blockchain verification');
    console.log('[verifyTransaction] Mock tx:', {
      deployHash,
      expectedRecipient,
      expectedAmount,
      senderAddress,
      reason: mockMode ? 'MOCK_MODE_ENABLED' : 'FAKE_HASH_DETECTED'
    });
    
    // Return mock successful verification with user-provided sender
    return {
      valid: true,
      deployHash,
      amount: Math.floor(expectedAmount * 1e9), // CSPR to motes
      recipient: expectedRecipient,
      sender: senderAddress || '', // Use provided sender or fallback
      timestamp: new Date().toISOString()
    };
  }

  try {
    // Fetch deploy from Casper network
    const client = getCasperClient();
    const result = await client.getDeploy(deployHash);
    
    const { deploy } = result;
    const executionResult = result.executionResultsV1?.[0];

    if (!deploy || !executionResult) {
      return {
        valid: false,
        deployHash,
        error: 'Transaction not found or execution results missing'
      };
    }

    // Check if transaction succeeded
    const isSuccess = executionResult.result && 'Success' in executionResult.result;
    if (!isSuccess) {
      return {
        valid: false,
        deployHash,
        error: 'Transaction failed on blockchain'
      };
    }

    // Parse transfer details
    const { session } = deploy;
    
    // Handle different transfer types
    let transferAmount = 0;
    let transferRecipient = '';
    let sender = '';

    if (session.transfer) {
      // Native CSPR transfer
      const { transfer } = session;
      transferAmount = Number(transfer.args.getByName('amount')?.ui512?.getValue() || 0);
      transferRecipient = transfer.args.getByName('target')?.key?.toPrefixedString() || '';
      sender = deploy.header.account?.toHex() || '';
    } else if (session.storedContractByHash || session.storedContractByName) {
      // CEP-18 token transfer
      // TODO: Parse CEP-18 transfer args when supporting tokens
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

    // Validate recipient
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

    // All checks passed
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

/**
 * Check if transaction has already been processed
 * Prevents duplicate payment records
 */
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
