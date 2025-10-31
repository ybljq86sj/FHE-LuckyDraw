import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fheModule from '@/lib/fhe';

const mockHandles = [new Uint8Array(32).fill(1)];
const mockProof = new Uint8Array(64).fill(2);

const buildMockFhe = () => {
  const encrypt = vi.fn().mockResolvedValue({ handles: mockHandles, inputProof: mockProof });
  const input = {
    add64: vi.fn(),
    add32: vi.fn(),
    encrypt,
  };

  return {
    createEncryptedInput: vi.fn().mockReturnValue(input),
    __input: input,
  } as const;
};

let mockFhe: ReturnType<typeof buildMockFhe>;
let relayerSDK: any;

describe('FHE helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    fheModule.__resetFHECacheForTests();
    mockFhe = buildMockFhe();
    relayerSDK = {
      initSDK: vi.fn().mockResolvedValue(undefined),
      createInstance: vi.fn().mockResolvedValue(mockFhe),
      SepoliaConfig: {},
    };
    (globalThis as any).window = {
      relayerSDK,
      ethereum: {},
    };
  });

  afterEach(() => {
    delete (globalThis as any).window;
  });

  it('converts handles to 0x-prefixed hex', async () => {
    const { encryptedNumber, proof } = await fheModule.encryptNumber(
      42,
      '0x1dEdc2d6A080809EFD0cb6b776f94905b12e6F11',
      '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
    );

    expect(mockFhe.__input.add32).toHaveBeenCalledWith(42);
    expect(encryptedNumber).toMatch(/^0x[0-9a-f]{64}$/i);
    expect(proof).toMatch(/^0x[0-9a-f]+$/i);
  });

  it('supports bigint amounts when encrypting funds', async () => {
    await fheModule.encryptAmount(
      1234n,
      '0x1dEdc2d6A080809EFD0cb6b776f94905b12e6F11',
      '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
    );

    expect(mockFhe.__input.add64).toHaveBeenCalledWith(1234n);
  });

  it('throws when handles are not 32 bytes', () => {
    expect(() => fheModule.__toBytes32ForTests(new Uint8Array(16))).toThrow(/32 bytes/);
  });
});
