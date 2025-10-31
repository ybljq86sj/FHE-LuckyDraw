import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND_NAME } from '@/config/brand';

const testDir = fileURLToPath(new URL('.', import.meta.url));

const readProjectFile = (relativePath: string) =>
  readFileSync(resolve(testDir, '..', relativePath), 'utf-8');

describe('LuckyDraw branding assets', () => {
  it('defines the expected brand name constant', () => {
    expect(BRAND_NAME).toBe('LuckyDraw FHE');
  });

  it('updates the public metadata to the new brand', () => {
    const html = readProjectFile('index.html');
    expect(html).toContain('LuckyDraw FHE - Privacy-First Blockchain Lottery');
  });

  it('reuses the brand constant across core UI files', () => {
    const headerSource = readProjectFile('src/components/Header.tsx');
    const wagmiSource = readProjectFile('src/lib/wagmi.ts');
    const pageSource = readProjectFile('src/pages/Index.tsx');

    expect(headerSource).toContain('BRAND_NAME');
    expect(wagmiSource).toContain('appName: BRAND_NAME');
    expect(pageSource).toContain('{BRAND_NAME}');
  });
});
