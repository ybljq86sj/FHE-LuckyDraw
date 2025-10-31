import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { BRAND_NAME } from '@/config/brand';

export const config = getDefaultConfig({
  appName: BRAND_NAME,
  projectId: 'f4e66c1c68d23c97a0b4e7bfaf9c8e4d', // WalletConnect Project ID
  chains: [sepolia],
  ssr: false,
});
