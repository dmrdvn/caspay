import { useState, useCallback } from 'react';

type TransferStatus = 'idle' | 'connecting' | 'signing' | 'sending' | 'confirming' | 'success' | 'error';

type TransferResult = {
  deployHash: string;
  success: boolean;
  error?: string;
};

type TransferParams = {
  recipientAddress: string;
  amount: number; // in CSPR
  memo?: string;
};

export function useCasperTransfer() {
  const [status, setStatus] = useState<TransferStatus>('idle');
  const [deployHash, setDeployHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  const transfer = useCallback(async (params: TransferParams): Promise<TransferResult> => {
    try {
      setStatus('connecting');
      setError('');
      setDeployHash('');

      const CasperWalletProvider = (window as any).CasperWalletProvider;
      if (!CasperWalletProvider) {
        throw new Error('Casper Wallet not installed');
      }

      const provider = CasperWalletProvider();

      const connected = await provider.requestConnection();
      if (!connected) {
        throw new Error('Wallet connection denied');
      }

      const activeKey = await provider.getActivePublicKey();
      if (!activeKey) {
        throw new Error('No active key found');
      }

      setStatus('signing');

      const amountInMotes = Math.floor(params.amount * 1_000_000_000).toString();

      const deployParams = {
        deploy: {
          approvals: [],
          hash: '',
          header: {
            account: activeKey,
            timestamp: new Date().toISOString(),
            ttl: '30m',
            gas_price: 1,
            body_hash: '',
            dependencies: [],
            chain_name: 'casper',
          },
          payment: {
            ModuleBytes: {
              module_bytes: '',
              args: [
                ['amount', { cl_type: 'U512', bytes: '', parsed: '100000000' }],
              ],
            },
          },
          session: {
            Transfer: {
              args: [
                ['amount', { cl_type: 'U512', bytes: '', parsed: amountInMotes }],
                ['target', { cl_type: 'PublicKey', bytes: '', parsed: params.recipientAddress }],
                ['id', { cl_type: { Option: 'U64' }, bytes: '', parsed: params.memo || null }],
              ],
            },
          },
        },
      };

      const signedDeployJson = await provider.sign(
        JSON.stringify(deployParams),
        activeKey
      );

      setStatus('sending');

      const response = await fetch('https://rpc.mainnet.casperlabs.io/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'account_put_deploy',
          params: [JSON.parse(signedDeployJson)],
          id: 1,
        }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message || 'Failed to send deploy');
      }

      const hash = result.result.deploy_hash;
      setDeployHash(hash);
      setStatus('confirming');

      const maxAttempts = 60;
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          const checkResponse = await fetch('https://rpc.mainnet.casperlabs.io/rpc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'info_get_deploy',
              params: { deploy_hash: hash },
              id: 1,
            }),
          });

          const data = await checkResponse.json();

          if (data.result?.execution_results?.[0]?.result?.Success) {
            setStatus('success');
            return {
              deployHash: hash,
              success: true,
            };
          }

          if (data.result?.execution_results?.[0]?.result?.Failure) {
            const errorMsg = data.result.execution_results[0].result.Failure.error_message;
            throw new Error(errorMsg || 'Transaction failed');
          }
        } catch (err: any) {
          if (err.message?.includes('deploy not known') || attempts === 0) {
            // Waiting for deploy to be known
          } else {
            throw err;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
      }

      throw new Error('Transaction confirmation timeout');

    } catch (err: any) {
      console.error('[useCasperTransfer] Error:', err);
      setStatus('error');
      setError(err.message || 'Transfer failed');
      
      return {
        deployHash: '',
        success: false,
        error: err.message,
      };
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setDeployHash('');
    setError('');
  }, []);

  return {
    transfer,
    reset,
    status,
    deployHash,
    error,
    isLoading: ['connecting', 'signing', 'sending', 'confirming'].includes(status),
  };
}
