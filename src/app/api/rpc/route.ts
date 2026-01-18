import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const CASPER_RPC_URLS = {
  mainnet: process.env.NEXT_PUBLIC_RPC_URL_MAINNET || 'https://node.mainnet.cspr.cloud/rpc',
  testnet: process.env.NEXT_PUBLIC_RPC_URL || 'https://node.testnet.cspr.cloud/rpc',
};

const CSPR_CLOUD_API_KEY = process.env.CSPR_CLOUD_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deploy, network = 'testnet' } = body;

    if (!deploy) {
      return NextResponse.json(
        { error: 'Deploy data is required' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }

    const rpcUrl = network === 'mainnet' 
      ? CASPER_RPC_URLS.mainnet 
      : CASPER_RPC_URLS.testnet;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if available (for cspr.cloud)
    if (CSPR_CLOUD_API_KEY) {
      headers['Authorization'] = CSPR_CLOUD_API_KEY;
    }

    const rpcPayload = {
      jsonrpc: '2.0',
      method: 'account_put_deploy',
      params: [deploy],
      id: Date.now(),
    };

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(rpcPayload),
    });

    const result = await response.json();

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message || 'RPC error' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      deploy_hash: result.result?.deploy_hash || result.result,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error: any) {
    console.error('RPC Proxy Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
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
