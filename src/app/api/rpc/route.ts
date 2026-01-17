import { NextRequest, NextResponse } from 'next/server';

const CSPR_CLOUD_API_KEY = process.env.CSPR_CLOUD_API_KEY;

const RPC_URLS = {
  mainnet: {
    primary: 'https://node.cspr.cloud/rpc',
    fallback: ['https://rpc.mainnet.casperlabs.io/rpc'],
  },
  testnet: {
    primary: 'https://node.testnet.cspr.cloud/rpc',
    fallback: ['https://rpc.testnet.casperlabs.io/rpc'],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deploy, network = 'testnet' } = body;

    if (!deploy) {
      return NextResponse.json(
        { error: 'Deploy data is required' },
        { status: 400 }
      );
    }

    const rpcConfig = network === 'mainnet' ? RPC_URLS.mainnet : RPC_URLS.testnet;
    const allUrls = [rpcConfig.primary, ...rpcConfig.fallback];
    
    let lastError: string = '';
    
    for (const rpcUrl of allUrls) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (rpcUrl.includes('cspr.cloud') && CSPR_CLOUD_API_KEY) {
          headers['Authorization'] = CSPR_CLOUD_API_KEY;
        }
        
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'account_put_deploy',
            params: {
              deploy,
            },
          }),
        });

        if (!response.ok) {
          lastError = `HTTP ${response.status}`;
          continue;
        }

        const result = await response.json();

        if (result.error) {
          lastError = result.error.message || 'RPC error';
          continue;
        }

        return NextResponse.json({
          success: true,
          deploy_hash: result.result.deploy_hash,
        });
      } catch (e: any) {
        lastError = e.message || 'Unknown error';
        continue;
      }
    }

    return NextResponse.json(
      { error: `All RPC nodes failed: ${lastError}` },
      { status: 502 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
