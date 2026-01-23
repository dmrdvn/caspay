import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const NOWNODES_MAINNET_URL = process.env.NEXT_PUBLIC_RPC_URL_MAINNET!;
const CSPR_CLOUD_TESTNET_URL = process.env.NEXT_PUBLIC_RPC_URL!;
const NOWNODES_API_KEY = process.env.NOWNODES_API_KEY;

const FALLBACK_RPC_URLS = {
  mainnet: process.env.FALLBACK_RPC_URL_MAINNET || 'https://node.mainnet.cspr.cloud/rpc',
  testnet: process.env.FALLBACK_RPC_URL_TESTNET || 'https://node.testnet.cspr.cloud/rpc',
};

const CSPR_CLOUD_API_KEY = process.env.CSPR_CLOUD_API_KEY;

async function sendRpcRequest(
  url: string, 
  payload: any, 
  useNowNodesAuth: boolean = false,
  useFallbackAuth: boolean = false
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (useNowNodesAuth && NOWNODES_API_KEY) {
    headers['api-key'] = NOWNODES_API_KEY;
  }

  if (useFallbackAuth && CSPR_CLOUD_API_KEY) {
    headers['Authorization'] = CSPR_CLOUD_API_KEY;
  }

  return fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
}

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

    const isMainnet = network === 'mainnet';
    const primaryRpcUrl = isMainnet ? NOWNODES_MAINNET_URL : CSPR_CLOUD_TESTNET_URL;
    const fallbackRpcUrl = isMainnet ? FALLBACK_RPC_URLS.mainnet : FALLBACK_RPC_URLS.testnet;

    const rpcPayload = {
      jsonrpc: '2.0',
      method: 'account_put_deploy',
      params: [deploy],
      id: Date.now(),
    };

    let response = await sendRpcRequest(primaryRpcUrl, rpcPayload, isMainnet, !isMainnet);
    let result = await response.json();

    if (result.error || !response.ok) {
      console.warn('[RPC] Primary provider failed, trying fallback...', result.error);
      response = await sendRpcRequest(fallbackRpcUrl, rpcPayload, false, true);
      result = await response.json();
    }

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
