import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const CASPER_RPC_URLS = {
  mainnet: 'https://rpc.mainnet.casperlabs.io/rpc',
  testnet: 'https://rpc.testnet.casperlabs.io/rpc',
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

    const rpcUrl = network === 'mainnet' 
      ? CASPER_RPC_URLS.mainnet 
      : CASPER_RPC_URLS.testnet;

    const rpcPayload = {
      jsonrpc: '2.0',
      method: 'account_put_deploy',
      params: [deploy],
      id: Date.now(),
    };

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rpcPayload),
    });

    const result = await response.json();

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message || 'RPC error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deploy_hash: result.result?.deploy_hash || result.result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
