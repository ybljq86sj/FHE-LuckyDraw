import { getAddress, toHex } from "viem";

declare global {
  interface Window {
    relayerSDK?: {
      initSDK: () => Promise<void>;
      createInstance: (config: Record<string, unknown>) => Promise<any>;
      SepoliaConfig: Record<string, unknown>;
    };
    ethereum?: any;
    okxwallet?: any;
  }
}

let fheInstance: any = null;
let sdkPromise: Promise<any> | null = null;

const SDK_URL = 'https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs';

/**
 * Dynamically load Zama FHE SDK from CDN
 */
const loadSdk = async (): Promise<any> => {
  if (typeof window === 'undefined') {
    throw new Error('FHE SDK requires browser environment');
  }

  if (window.relayerSDK) {
    console.log('✅ SDK already loaded');
    return window.relayerSDK;
  }

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${SDK_URL}"]`) as HTMLScriptElement | null;
      if (existing) {
        console.log('⏳ SDK script tag exists, waiting...');
        // Wait a bit for SDK to initialize
        const checkInterval = setInterval(() => {
          if (window.relayerSDK) {
            clearInterval(checkInterval);
            resolve(window.relayerSDK);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkInterval);
          if (window.relayerSDK) {
            resolve(window.relayerSDK);
          } else {
            reject(new Error('SDK script exists but window.relayerSDK not initialized'));
          }
        }, 5000);
        return;
      }

      console.log('📦 Loading SDK from CDN...');
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;

      script.onload = () => {
        console.log('📦 Script loaded, waiting for SDK initialization...');
        // Give SDK time to initialize
        setTimeout(() => {
          if (window.relayerSDK) {
            console.log('✅ SDK initialized');
            resolve(window.relayerSDK);
          } else {
            console.error('❌ window.relayerSDK still undefined after load');
            reject(new Error('relayerSDK unavailable after load'));
          }
        }, 500);
      };

      script.onerror = () => {
        console.error('❌ Failed to load SDK script');
        reject(new Error('Failed to load FHE SDK'));
      };

      document.body.appendChild(script);
    });
  }

  return sdkPromise;
};

/**
 * Initialize FHE instance with Sepolia network configuration
 */
export async function initializeFHE(provider?: any): Promise<any> {
  if (fheInstance) {
    return fheInstance;
  }

  if (typeof window === 'undefined') {
    throw new Error('FHE SDK requires browser environment');
  }

  const ethereumProvider = provider ||
    window.ethereum ||
    (window as any).okxwallet?.provider ||
    (window as any).okxwallet ||
    (window as any).coinbaseWalletExtension;

  if (!ethereumProvider) {
    throw new Error('Ethereum provider not found. Please connect your wallet first.');
  }

  console.log('🔌 Using Ethereum provider:', {
    isOKX: !!(window as any).okxwallet,
    isMetaMask: !!(window.ethereum as any)?.isMetaMask,
  });

  const sdk = await loadSdk();
  if (!sdk) {
    throw new Error('FHE SDK not available');
  }

  await sdk.initSDK();

  const config = {
    ...sdk.SepoliaConfig,
    network: ethereumProvider,
  };

  fheInstance = await sdk.createInstance(config);
  console.log('✅ FHE instance initialized for Sepolia');

  return fheInstance;
}

/**
 * Encrypt a uint64 value
 */
const toBytes32 = (bytes: Uint8Array): `0x${string}` => {
  if (bytes.length !== 32) {
    throw new Error(`FHE handle must be 32 bytes; received ${bytes.length}`);
  }
  return toHex(bytes);
};

export const encryptAmount = async (
  amount: bigint,
  contractAddress: string,
  userAddress: string
): Promise<{
  encryptedAmount: `0x${string}`;
  proof: `0x${string}`;
}> => {
  console.log('[FHE] Encrypting amount:', amount.toString());

  const fhe = await initializeFHE();
  const checksumAddress = getAddress(contractAddress);

  console.log('[FHE] Creating encrypted input...');
  const input = fhe.createEncryptedInput(checksumAddress, userAddress);
  input.add64(amount);

  console.log('[FHE] Encrypting...');
  const { handles, inputProof } = await input.encrypt();

  console.log('[FHE] ✅ Encryption complete');

  return {
    encryptedAmount: toBytes32(handles[0]),
    proof: toHex(inputProof),
  };
};

/**
 * Encrypt a uint32 value (for lottery numbers)
 */
export const encryptNumber = async (
  number: number,
  contractAddress: string,
  userAddress: string
): Promise<{
  encryptedNumber: `0x${string}`;
  proof: `0x${string}`;
}> => {
  console.log('[FHE] Encrypting number:', number);

  const fhe = await initializeFHE();
  const checksumAddress = getAddress(contractAddress);

  console.log('[FHE] Creating encrypted input...');
  const input = fhe.createEncryptedInput(checksumAddress, userAddress);
  input.add32(number);

  console.log('[FHE] Encrypting...');
  const { handles, inputProof } = await input.encrypt();

  console.log('[FHE] ✅ Encryption complete');

  return {
    encryptedNumber: toBytes32(handles[0]),
    proof: toHex(inputProof),
  };
};

/**
 * Decrypt a euint64 value
 */
export const decryptAmount = async (
  handle: string,
  contractAddress: string,
  userAddress: string
): Promise<bigint> => {
  console.log('[FHE] Decrypting handle:', handle);

  const fhe = await initializeFHE();
  const checksumAddress = getAddress(contractAddress);

  console.log('[FHE] Requesting decryption...');
  const decrypted = await fhe.decrypt(checksumAddress, handle, userAddress);

  console.log('[FHE] ✅ Decryption complete');
  return BigInt(decrypted);
};

export const __resetFHECacheForTests = () => {
  fheInstance = null;
  sdkPromise = null;
};

export const __toBytes32ForTests = toBytes32;

/**
 * Decrypt a euint32 value (for lottery numbers)
 */
export const decryptNumber = async (
  handle: string,
  contractAddress: string,
  userAddress: string
): Promise<number> => {
  console.log('[FHE] Decrypting number handle:', handle);

  const fhe = await initializeFHE();
  const checksumAddress = getAddress(contractAddress);

  console.log('[FHE] Requesting decryption...');
  const decrypted = await fhe.decrypt(checksumAddress, handle, userAddress);

  console.log('[FHE] ✅ Decryption complete');
  return Number(decrypted);
};
