import { bytesToHex, getAddress, toHex } from "viem";
import type { Address } from "viem";

declare global {
  interface Window {
    RelayerSDK?: any;
    relayerSDK?: any;
    ethereum?: any;
    okxwallet?: any;
  }
}

let fheInstance: any = null;

const getSDK = () => {
  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires a browser environment");
  }
  const sdk = window.RelayerSDK || window.relayerSDK;
  if (!sdk) {
    throw new Error("Relayer SDK not loaded. Ensure the CDN script tag is present.");
  }
  return sdk;
};

export const initializeFHE = async (provider?: any) => {
  if (fheInstance) return fheInstance;
  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires a browser environment");
  }

  const ethereumProvider =
    provider || window.ethereum || window.okxwallet?.provider || window.okxwallet;
  if (!ethereumProvider) {
    throw new Error("No wallet provider detected. Connect a wallet first.");
  }

  const sdk = getSDK();
  const { initSDK, createInstance, SepoliaConfig } = sdk;
  await initSDK();
  const config = { ...SepoliaConfig, network: ethereumProvider };
  fheInstance = await createInstance(config);
  return fheInstance;
};

const getInstance = async (provider?: any) => {
  if (fheInstance) return fheInstance;
  return initializeFHE(provider);
};

/**
 * Helper to convert bytes to 0x-prefixed hex string
 */
const toBytes32 = (bytes: Uint8Array): `0x${string}` => {
  if (bytes.length !== 32) {
    throw new Error(`FHE handle must be 32 bytes; received ${bytes.length}`);
  }
  return bytesToHex(bytes);
};

/**
 * Encrypt a uint32 number (for lottery ticket numbers)
 * @param number - The ticket number to encrypt
 * @param contractAddress - The lottery contract address
 * @param userAddress - The user's wallet address
 * @param provider - Optional ethereum provider
 */
export const encryptNumber = async (
  number: number,
  contractAddress: string,
  userAddress: string,
  provider?: any
): Promise<{
  encryptedNumber: `0x${string}`;
  proof: `0x${string}`;
}> => {
  console.log('[FHE] Encrypting number:', number);
  const instance = await getInstance(provider);
  const contractAddr = getAddress(contractAddress);
  const userAddr = getAddress(userAddress);

  console.log('[FHE] Creating encrypted input for:', {
    contract: contractAddr,
    user: userAddr,
  });

  const input = instance.createEncryptedInput(contractAddr, userAddr);
  input.add32(number);

  console.log('[FHE] Encrypting input...');
  const { handles, inputProof } = await input.encrypt();
  console.log('[FHE] Encryption complete, handles:', handles.length);

  if (handles.length < 1) {
    throw new Error('FHE SDK returned insufficient handles');
  }

  return {
    encryptedNumber: toBytes32(handles[0]),
    proof: bytesToHex(inputProof) as `0x${string}`,
  };
};

/**
 * Encrypt a uint64 value
 */
export const encryptAmount = async (
  amount: bigint,
  contractAddress: string,
  userAddress: string,
  provider?: any
): Promise<{
  encryptedAmount: `0x${string}`;
  proof: `0x${string}`;
}> => {
  console.log('[FHE] Encrypting amount:', amount.toString());

  const instance = await getInstance(provider);
  const contractAddr = getAddress(contractAddress);
  const userAddr = getAddress(userAddress);

  console.log('[FHE] Creating encrypted input...');
  const input = instance.createEncryptedInput(contractAddr, userAddr);
  input.add64(amount);

  console.log('[FHE] Encrypting...');
  const { handles, inputProof } = await input.encrypt();

  console.log('[FHE] ✅ Encryption complete');

  return {
    encryptedAmount: toBytes32(handles[0]),
    proof: bytesToHex(inputProof) as `0x${string}`,
  };
};

/**
 * Decrypt a euint32 value (for lottery numbers)
 */
export const decryptNumber = async (
  handle: string,
  contractAddress: string,
  userAddress: string,
  provider?: any
): Promise<number> => {
  console.log('[FHE] Decrypting number handle:', handle);

  const instance = await getInstance(provider);
  const contractAddr = getAddress(contractAddress);
  const userAddr = getAddress(userAddress);

  console.log('[FHE] Requesting decryption...');
  const decrypted = await instance.decrypt(contractAddr, handle, userAddr);

  console.log('[FHE] ✅ Decryption complete');
  return Number(decrypted);
};

/**
 * Decrypt a euint64 value
 */
export const decryptAmount = async (
  handle: string,
  contractAddress: string,
  userAddress: string,
  provider?: any
): Promise<bigint> => {
  console.log('[FHE] Decrypting handle:', handle);

  const instance = await getInstance(provider);
  const contractAddr = getAddress(contractAddress);
  const userAddr = getAddress(userAddress);

  console.log('[FHE] Requesting decryption...');
  const decrypted = await instance.decrypt(contractAddr, handle, userAddr);

  console.log('[FHE] ✅ Decryption complete');
  return BigInt(decrypted);
};

/**
 * Check if FHE SDK is loaded and ready
 */
export const isFHEReady = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(window.RelayerSDK || window.relayerSDK);
};

// Alias for compatibility
export const isFheReady = (): boolean => {
  return fheInstance !== null;
};

export const isSDKLoaded = isFHEReady;

/**
 * Wait for FHE SDK to be loaded (with timeout)
 */
export const waitForFHE = async (timeoutMs: number = 10000): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (isFHEReady()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return false;
};

/**
 * Get FHE status for debugging
 */
export const getFHEStatus = (): {
  sdkLoaded: boolean;
  instanceReady: boolean;
} => {
  return {
    sdkLoaded: isFHEReady(),
    instanceReady: fheInstance !== null,
  };
};

/**
 * Reset FHE cache (for testing)
 */
export const __resetFHECacheForTests = () => {
  fheInstance = null;
};

export const __toBytes32ForTests = toBytes32;
