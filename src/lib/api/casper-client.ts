/**
 * Casper Client - Server-Side Only
 * 
 * Deploy edilmiş contract'a call yapma (veri yazma/okuma)
 * UYARI: Bu dosya sadece server-side'da kullanılmalıdır!
 */

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

// ----------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------
// RPC Client Singleton
// ----------------------------------------------------------------------

let rpcClientInstance: RpcClient | null = null;
let privateKeyInstance: PrivateKey | null = null;

/**
 * Get or create RPC client instance
 */
function getRpcClient(): RpcClient {
  if (!rpcClientInstance) {
    const rpcHandler = new HttpHandler(RPC_URL);
    
    // Add CSPR.cloud authorization if API key is provided
    if (CSPR_CLOUD_API_KEY) {
      rpcHandler.setCustomHeaders({
        'Authorization': CSPR_CLOUD_API_KEY
      });
      console.log('[Casper Client] CSPR.cloud authorization enabled');
    }
    
    rpcClientInstance = new RpcClient(rpcHandler);
  }
  return rpcClientInstance;
}

/**
 * Get or create private key instance
 */
async function getPrivateKey(): Promise<PrivateKey> {
  if (!privateKeyInstance) {
    try {
      // Private key PEM formatında (\n ile ayrılmış)
      // \n karakterlerini gerçek newline'a çevir
      const pemKey = PRIVATE_KEY_BASE64!.replace(/\\n/g, '\n');
      
      // PEM formatından private key oluştur
      privateKeyInstance = PrivateKey.fromPem(pemKey, KeyAlgorithm.ED25519);
      
      console.log('[Casper Client] Private key initialized successfully');
    } catch (error) {
      console.error('[Casper Client] Private key initialization failed:', error);
      throw new Error('Failed to initialize private key');
    }
  }
  return privateKeyInstance;
}

// ----------------------------------------------------------------------
// Contract Call - Main Function
// ----------------------------------------------------------------------

/**
 * Contract'a call yap (veri yaz)
 * 
 * @param entryPoint Contract fonksiyon adı (örn: "register_merchant")
 * @param args Arguments (Args object)
 * @param paymentAmount Gas fee (motes cinsinden, default: 10 CSPR)
 * @returns Deploy hash
 */
export async function callContract(
  entryPoint: string,
  args: Args,
  paymentAmount: string = '10000000000' // 10 CSPR
): Promise<string> {
  try {
    console.log(`[Casper Client] Calling contract: ${entryPoint}`);
    
    const privateKey = await getPrivateKey();
    const publicKey = privateKey.publicKey;
    
    console.log('[Casper Client] Private key initialized successfully');
    console.log('[Casper Client] Public Key:', publicKey.toHex());
    console.log('[Casper Client] Account Hash:', publicKey.accountHash().toHex());

    // Deploy header oluştur
    const deployHeader = DeployHeader.default();
    deployHeader.account = publicKey;
    deployHeader.chainName = NETWORK_NAME;

    // Contract package hash kullan (versioned contract)
    const contractHashBytes = Buffer.from(CONTRACT_PACKAGE_HASH!, 'hex');
    const hash = new Hash(contractHashBytes);
    const contractHash = new ContractHash(hash, '');
    
    console.log('[Casper Client] Using contract package hash:', CONTRACT_PACKAGE_HASH);
    
    // Stored versioned contract by hash - package hash + entry point + args + version number
    const storedContract = new StoredVersionedContractByHash(
      contractHash,
      entryPoint,
      args,
      1 // version (number)
    );

    // Session item oluştur
    const session = new ExecutableDeployItem();
    session.storedVersionedContractByHash = storedContract;

    // Payment oluştur - standardPayment kullan
    const payment = ExecutableDeployItem.standardPayment(paymentAmount);

    // Deploy oluştur
    const deploy = Deploy.makeDeploy(deployHeader, payment, session);

    // Deploy'u imzala
    deploy.sign(privateKey);

    // Deploy'u gönder
    const rpcClient = getRpcClient();
    const result = await rpcClient.putDeploy(deploy);
    
    const deployHashHex = result.deployHash.toHex();
    console.log(`[Casper Client] Deploy sent: ${deployHashHex}`);
    
    return deployHashHex;
  } catch (error: any) {
    console.error(`[Casper Client] Contract call failed:`, error);
    console.error('Error stack:', error.stack);
    throw new Error(`Contract call failed: ${error.message}`);
  }
}

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

/**
 * Create empty Args
 */
export function createEmptyArgs(): Args {
  return new Args(new Map());
}

/**
 * Add string argument
 */
export function addStringArg(args: Args, name: string, value: string): void {
  // WORKAROUND: casper-js-sdk v5 CLValue factory methods don't serialize bytes
  const clValue = CLValue.newCLString(value);
  
  // Manual serialization
  const stringBytes = Buffer.from(value, 'utf8');
  const lengthBytes = Buffer.alloc(4);
  lengthBytes.writeUInt32LE(stringBytes.length, 0);
  const typeTag = Buffer.from([10]); // CLType String = 10
  const serialized = Buffer.concat([lengthBytes, stringBytes, typeTag]);
  
  // DON'T override bytes() - instead set bytes property directly
  Object.defineProperty(clValue, 'bytes', {
    value: () => serialized,
    writable: false,
    configurable: true
  });
  
  console.log(`[Casper Client] String arg ${name}: bytes=${serialized.length}`);
  args.insert(name, clValue);
}

/**
 * Add number argument (u32)
 */
export function addU32Arg(args: Args, name: string, value: number): void {
  const clValue = CLValue.newCLUInt32(value);
  
  // Manual serialization for u32
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value, 0);
  const typeTag = Buffer.from([1]); // CLType U32 = 1
  const serialized = Buffer.concat([buffer, typeTag]);
  
  Object.defineProperty(clValue, 'bytes', {
    value: () => serialized,
    writable: false,
    configurable: true
  });
  
  console.log(`[Casper Client] U32 arg ${name}: bytes=${serialized.length}`);
  args.insert(name, clValue);
}

/**
 * Add boolean argument
 */
export function addBoolArg(args: Args, name: string, value: boolean): void {
  const clValue = CLValue.newCLValueBool(value);
  
  // Manual serialization for bool
  const boolByte = Buffer.from([value ? 1 : 0]);
  const typeTag = Buffer.from([0]); // CLType Bool = 0
  const serialized = Buffer.concat([boolByte, typeTag]);
  
  Object.defineProperty(clValue, 'bytes', {
    value: () => serialized,
    writable: false,
    configurable: true
  });
  
  console.log(`[Casper Client] Bool arg ${name}: bytes=${serialized.length}`);
  args.insert(name, clValue);
}

/**
 * Add U512 argument (for prices/amounts)
 */
export function addU512Arg(args: Args, name: string, value: string): void {
  const clValue = CLValue.newCLUInt512(value);
  
  // Manual serialization for U512 (little-endian variable length)
  const bigIntValue = BigInt(value);
  
  if (bigIntValue === BigInt(0)) {
    // Special case for zero
    const serialized = Buffer.concat([Buffer.from([1, 0]), Buffer.from([8])]);
    Object.defineProperty(clValue, 'bytes', {
      value: () => serialized,
      writable: false,
      configurable: true
    });
    console.log(`[Casper Client] U512 arg ${name}: bytes=${serialized.length}`);
    args.insert(name, clValue);
    return;
  }
  
  // Convert to hex and create byte array
  let hex = bigIntValue.toString(16);
  if (hex.length % 2) hex = '0' + hex; // Pad to even length
  
  const valueBytes = Buffer.from(hex, 'hex');
  const reversedBytes = Buffer.from(valueBytes).reverse(); // Little-endian
  
  const lengthByte = Buffer.from([reversedBytes.length]);
  const typeTag = Buffer.from([8]); // CLType U512 = 8
  const serialized = Buffer.concat([lengthByte, reversedBytes, typeTag]);
  
  Object.defineProperty(clValue, 'bytes', {
    value: () => serialized,
    writable: false,
    configurable: true
  });
  
  console.log(`[Casper Client] U512 arg ${name}: bytes=${serialized.length}`);
  args.insert(name, clValue);
}

/**
 * Add PublicKey argument
 */
export function addPublicKeyArg(args: Args, name: string, value: PublicKey): void {
  // WORKAROUND: casper-js-sdk v5 CLValue factory methods don't serialize bytes
  const clValue = CLValue.newCLPublicKey(value);
  
  // Manual serialization
  const pubKeyRaw = value.bytes(); // Get raw bytes
  const typeTag = Buffer.from([22]); // CLType PublicKey = 22
  const serialized = Buffer.concat([Buffer.from(pubKeyRaw), typeTag]);
  
  Object.defineProperty(clValue, 'bytes', {
    value: () => serialized,
    writable: false,
    configurable: true
  });
  
  console.log(`[Casper Client] PublicKey arg ${name}: bytes=${serialized.length}`);
  args.insert(name, clValue);
}

/**
 * Parse hex address to PublicKey
 */
export function parseAddress(addressHex: string): PublicKey {
  return PublicKey.fromHex(addressHex);
}

/**
 * Convert CSPR to motes (1 CSPR = 10^9 motes)
 */
export function csprToMotes(cspr: number): string {
  return (cspr * 1_000_000_000).toString();
}

/**
 * Convert motes to CSPR
 */
export function motesToCspr(motes: string): number {
  return parseInt(motes, 10) / 1_000_000_000;
}

/**
 * Wait for deploy to be executed (optional - for production use)
 */
export async function waitForDeploy(
  deployHash: string,
  timeoutMs: number = 180000 // 3 dakika
): Promise<any> {
  const rpcClient = getRpcClient();
  const startTime = Date.now();

  console.log(`[Casper Client] Waiting for deploy: ${deployHash}`);

  while (Date.now() - startTime < timeoutMs) {
    try {
      const result = await rpcClient.getDeploy(deployHash);
      
      if (result.executionResultsV1 && result.executionResultsV1.length > 0) {
        const execution = result.executionResultsV1[0];
        
        if (execution.result.success) {
          console.log('[Casper Client] Deploy executed successfully');
          return result;
        } else if (execution.result.failure) {
          throw new Error(`Deploy failed: ${JSON.stringify(execution.result.failure)}`);
        }
      }
    } catch (error: any) {
      // Deploy henüz işlenmemiş, devam et
      if (!error.message.includes('not found')) {
        console.error('[Casper Client] Error checking deploy:', error);
      }
    }

    // 5 saniye bekle
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  throw new Error('Deploy timeout - execution took too long');
}
