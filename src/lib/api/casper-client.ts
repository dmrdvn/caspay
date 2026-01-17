import {
  Args,
  CLValue,
  ContractHash,
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  Hash,
  HttpHandler,
  KeyAlgorithm,
  PrivateKey,
  PublicKey,
  RpcClient,
  StoredVersionedContractByHash,
} from 'casper-js-sdk';

const BufferPolyfill = (() => {
  if (typeof Buffer !== 'undefined') {
    return Buffer;
  }
  
  return {
    from(data: string | number[] | Uint8Array, encoding?: BufferEncoding): Uint8Array {
      if (typeof data === 'string') {
        if (encoding === 'hex') {
          const matches = data.match(/.{1,2}/g) || [];
          return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
        }
        if (encoding === 'utf8' || !encoding) {
          return new TextEncoder().encode(data);
        }
      }
      if (Array.isArray(data)) {
        return new Uint8Array(data);
      }
      return data as Uint8Array;
    },
    
    alloc(size: number): Uint8Array {
      return new Uint8Array(size);
    },
    
    concat(buffers: Uint8Array[]): Uint8Array {
      const totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const buf of buffers) {
        result.set(buf, offset);
        offset += buf.length;
      }
      return result;
    },
  };
})();

const PRIVATE_KEY_BASE64 = process.env.CASPAY_ADMIN_PRIVATE_KEY;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:7778';
const CSPR_CLOUD_API_KEY = process.env.CSPR_CLOUD_API_KEY; // For production
const CONTRACT_PACKAGE_HASH = process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_HASH;
const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK || 'casper-test';

if (!PRIVATE_KEY_BASE64) {
  throw new Error('CASPAY_ADMIN_PRIVATE_KEY environment variable is required');
}

if (!CONTRACT_PACKAGE_HASH) {
  throw new Error('NEXT_PUBLIC_CONTRACT_PACKAGE_HASH environment variable is required');
}

let rpcClientInstance: RpcClient | null = null;
let privateKeyInstance: PrivateKey | null = null;

function getRpcClient(): RpcClient {
  if (!rpcClientInstance) {
    const rpcHandler = new HttpHandler(RPC_URL);
    
    if (CSPR_CLOUD_API_KEY) {
      rpcHandler.setCustomHeaders({
        'Authorization': CSPR_CLOUD_API_KEY
      });
    }
    
    rpcClientInstance = new RpcClient(rpcHandler);
  }
  return rpcClientInstance;
}

async function getPrivateKey(): Promise<PrivateKey> {
  if (!privateKeyInstance) {
    try {
      const pemKey = PRIVATE_KEY_BASE64!.replace(/\\n/g, '\n');
      privateKeyInstance = PrivateKey.fromPem(pemKey, KeyAlgorithm.ED25519);
    } catch (error) {
      throw new Error('Failed to initialize private key');
    }
  }
  return privateKeyInstance;
}

export async function callContract(
  entryPoint: string,
  args: Args,
  paymentAmount: string = '10000000000'
): Promise<string> {
  try {
    const privateKey = await getPrivateKey();
    const publicKey = privateKey.publicKey;

    const deployHeader = DeployHeader.default();
    deployHeader.account = publicKey;
    deployHeader.chainName = NETWORK_NAME;

    const contractHashBytes = BufferPolyfill.from(CONTRACT_PACKAGE_HASH!, 'hex');
    const hash = new Hash(contractHashBytes);
    const contractHash = new ContractHash(hash, '');
    
    const storedContract = new StoredVersionedContractByHash(
      contractHash,
      entryPoint,
      args,
      1
    );

    const session = new ExecutableDeployItem();
    session.storedVersionedContractByHash = storedContract;

    const payment = ExecutableDeployItem.standardPayment(paymentAmount);

    const deploy = Deploy.makeDeploy(deployHeader, payment, session);

    deploy.sign(privateKey);

    const rpcClient = getRpcClient();
    const result = await rpcClient.putDeploy(deploy);
    
    const deployHashHex = result.deployHash.toHex();
    
    return deployHashHex;
  } catch (error: any) {
    throw new Error(`Contract call failed: ${error.message}`);
  }
}

export function createEmptyArgs(): Args {
  return new Args(new Map());
}

export function addStringArg(args: Args, name: string, value: string): void {
  const clValue = CLValue.newCLString(value);
  
  const stringBytes = BufferPolyfill.from(value, 'utf8');
  const lengthBytes = BufferPolyfill.alloc(4);
  new DataView(lengthBytes.buffer).setUint32(0, stringBytes.length, true);
  const typeTag = BufferPolyfill.from([10]);
  const serialized = BufferPolyfill.concat([lengthBytes, stringBytes, typeTag]);
  
  Object.defineProperty(clValue, 'bytes', {
    value: () => serialized,
    writable: false,
    configurable: true
  });
  
  args.insert(name, clValue);
}

export function addU32Arg(args: Args, name: string, value: number): void {
  const clValue = CLValue.newCLUInt32(value);
  
  const buffer = BufferPolyfill.alloc(4);
  new DataView(buffer.buffer).setUint32(0, value, true);
  const typeTag = BufferPolyfill.from([1]);
  const serialized = BufferPolyfill.concat([buffer, typeTag]);
  
  Object.defineProperty(clValue, 'bytes', {
    value: () => serialized,
    writable: false,
    configurable: true
  });
  
  args.insert(name, clValue);
}

export function addBoolArg(args: Args, name: string, value: boolean): void {
  const clValue = CLValue.newCLValueBool(value);
  
  const boolByte = BufferPolyfill.from([value ? 1 : 0]);
  const typeTag = BufferPolyfill.from([0]);
  const serialized = BufferPolyfill.concat([boolByte, typeTag]);
  
  Object.defineProperty(clValue, 'bytes', {
    value: () => serialized,
    writable: false,
    configurable: true
  });
  
  args.insert(name, clValue);
}

export function addU512Arg(args: Args, name: string, value: string): void {
  const clValue = CLValue.newCLUInt512(value);
  
  const bigIntValue = BigInt(value);
  
  if (bigIntValue === BigInt(0)) {
    const serialized = BufferPolyfill.concat([BufferPolyfill.from([1, 0]), BufferPolyfill.from([8])]);
    Object.defineProperty(clValue, 'bytes', {
      value: () => serialized,
      writable: false,
      configurable: true
    });
    args.insert(name, clValue);
    return;
  }
  
  let hex = bigIntValue.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  
  const valueBytes = BufferPolyfill.from(hex, 'hex');
  const reversedBytes = BufferPolyfill.from(valueBytes).reverse();
  
  const lengthByte = BufferPolyfill.from([reversedBytes.length]);
  const typeTag = BufferPolyfill.from([8]);
  const serialized = BufferPolyfill.concat([lengthByte, reversedBytes, typeTag]);
  
  Object.defineProperty(clValue, 'bytes', {
    value: () => serialized,
    writable: false,
    configurable: true
  });
  
  args.insert(name, clValue);
}

export function addPublicKeyArg(args: Args, name: string, value: PublicKey): void {
  const clValue = CLValue.newCLPublicKey(value);
  
  const pubKeyRaw = value.bytes();
  const typeTag = BufferPolyfill.from([22]);
  const serialized = BufferPolyfill.concat([BufferPolyfill.from(pubKeyRaw), typeTag]);
  
  Object.defineProperty(clValue, 'bytes', {
    value: () => serialized,
    writable: false,
    configurable: true
  });
  
  args.insert(name, clValue);
}

export function parseAddress(addressHex: string): PublicKey {
  return PublicKey.fromHex(addressHex);
}

export function csprToMotes(cspr: number): string {
  return (cspr * 1_000_000_000).toString();
}

export function motesToCspr(motes: string): number {
  return parseInt(motes, 10) / 1_000_000_000;
}

export async function waitForDeploy(
  deployHash: string,
  timeoutMs: number = 180000
): Promise<any> {
  const rpcClient = getRpcClient();
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      const result = await rpcClient.getDeploy(deployHash);
      
      if (result.executionResultsV1 && result.executionResultsV1.length > 0) {
        const execution = result.executionResultsV1[0];
        
        if (execution.result.success) {
          return result;
        } else if (execution.result.failure) {
          throw new Error(`Deploy failed: ${JSON.stringify(execution.result.failure)}`);
        }
      }
    } catch (error: any) {
      if (!error.message.includes('not found')) {
        throw error;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  throw new Error('Deploy timeout - execution took too long');
}
