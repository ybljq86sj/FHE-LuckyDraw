import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'FHELottery',
  projectId: 'f4e66c1c68d23c97a0b4e7bfaf9c8e4d', // WalletConnect Project ID
  chains: [sepolia],
  ssr: false,
});
