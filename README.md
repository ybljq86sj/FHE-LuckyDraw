# FHE Lucky Draw 🎰

A privacy-preserving decentralized lottery platform built with Fully Homomorphic Encryption (FHE) technology using Zama's fhEVM.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://luckydraw-fhe.vercel.app)
[![Sepolia](https://img.shields.io/badge/network-Sepolia-blue)](https://sepolia.etherscan.io/address/0x1A13d8b13f11ac34d2c606d1c47117Fa9974bdAe)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 📖 Table of Contents

- [Overview](#overview)
- [Why FHE Lucky Draw?](#why-fhe-lucky-draw)
- [What is Fully Homomorphic Encryption (FHE)?](#what-is-fully-homomorphic-encryption-fhe)
- [Smart Contract Architecture](#smart-contract-architecture)
- [Technical Architecture](#technical-architecture)
- [Getting Started](#getting-started)
- [Deployment Guide](#deployment-guide)
- [Testing](#testing)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)

## 🎯 Overview

FHE Lucky Draw revolutionizes traditional lottery systems by leveraging **Fully Homomorphic Encryption (FHE)** to ensure complete privacy and fairness. Unlike conventional lotteries where numbers can be visible or manipulated, our platform keeps all lottery numbers **encrypted on-chain** until the draw is completed.

### Key Features

- 🔒 **Complete Privacy**: Lottery numbers remain encrypted end-to-end
- ✅ **Provably Fair**: All operations are transparent and verifiable on-chain
- 🎯 **Trustless**: No central authority can manipulate results
- ⚡ **Gas Efficient**: Optimized for Ethereum Sepolia testnet
- 🌐 **Web3 Native**: Seamless wallet integration (MetaMask, WalletConnect)

### Live Demo

- **Website**: [https://luckydraw-fhe.vercel.app](https://luckydraw-fhe.vercel.app)
- **Contract**: [0x1A13d8b13f11ac34d2c606d1c47117Fa9974bdAe](https://sepolia.etherscan.io/address/0x1A13d8b13f11ac34d2c606d1c47117Fa9974bdAe)
- **Network**: Ethereum Sepolia Testnet

## 🤔 Why FHE Lucky Draw?

Traditional lottery systems suffer from several critical issues:

| Problem | Traditional Lottery | FHE Lucky Draw |
|---------|-------------------|----------------|
| **Privacy** | Numbers visible to operators | Numbers encrypted on-chain |
| **Trust** | Requires trust in central authority | Trustless smart contracts |
| **Manipulation** | Possible by insiders | Cryptographically impossible |
| **Transparency** | Limited, often opaque | Fully transparent and verifiable |
| **Fairness** | Questionable | Provably fair with FHE |

## 🔐 What is Fully Homomorphic Encryption (FHE)?

**Fully Homomorphic Encryption (FHE)** is a revolutionary cryptographic technique that allows computations to be performed on encrypted data without decrypting it first.

### How FHE Works in Lucky Draw

1. **Encryption**: Users encrypt their lottery numbers locally using Zama's FHE library
2. **On-Chain Storage**: Encrypted numbers are stored on Ethereum as `euint32` types
3. **Computation**: Smart contracts can compare encrypted numbers without revealing them
4. **Result**: Winners are determined without ever exposing individual ticket numbers

### FHE Benefits

- **Privacy-Preserving Computations**: Perform operations on encrypted data
- **No Decryption Required**: Results computed without exposing private data
- **Cryptographic Security**: Based on lattice-based cryptography
- **Blockchain Compatible**: Works seamlessly with Ethereum smart contracts

### Traditional Encryption vs FHE

```
Traditional Encryption:
Data → [Encrypt] → Ciphertext → [Must Decrypt] → Plaintext → [Compute] → Result

Fully Homomorphic Encryption:
Data → [Encrypt] → Ciphertext → [Compute on Encrypted] → Encrypted Result → [Decrypt] → Result
```

## 📜 Smart Contract Architecture

### Contract Overview

The `FHELottery` smart contract is the core of the system, handling all lottery operations with FHE encryption.

**Contract Address**: `0x1A13d8b13f11ac34d2c606d1c47117Fa9974bdAe`

### Data Structures

```solidity
struct Ticket {
    address buyer;           // Ticket owner
    euint32 number;         // Encrypted lottery number (FHE)
    bool claimed;           // Prize claim status
}

struct LotteryRound {
    string name;                              // Round name
    uint256 drawTime;                         // Scheduled draw time
    bool drawn;                               // Draw completion status
    uint32 plainWinningNumber;                // Revealed winning number (after draw)
    uint256 ticketCount;                      // Total tickets sold
    mapping(uint256 => Ticket) tickets;       // ticketId => Ticket
    mapping(address => uint256[]) userTickets; // user => ticketIds[]
}
```

### Key Functions

#### Admin Functions

```solidity
// Create a new lottery round
function createRound(string calldata name, uint256 drawTime) external onlyAdmin returns (uint256)

// Draw winning number for a round
function draw(uint256 roundId, uint32 plainWinningNumber) external onlyAdmin
```

#### User Functions

```solidity
// Buy a ticket with encrypted number
function buyTicket(
    uint256 roundId,
    externalEuint32 encryptedNumber,
    bytes memory proof
) external returns (uint256)

// Claim prize if ticket matches winning number
function claimPrize(uint256 roundId, uint256 ticketId) external

// Get user's ticket IDs for a round
function getMyTickets(uint256 roundId) external view returns (uint256[] memory)

// Get encrypted ticket number (only owner can decrypt)
function getMyTicketNumber(uint256 roundId, uint256 ticketId) external view returns (euint32)
```

#### View Functions

```solidity
// Get round information
function getRound(uint256 roundId) external view returns (
    string memory name,
    uint32 winningNumber,
    uint256 drawTime,
    bool drawn,
    uint256 ticketCount
)

// Get ticket information
function getTicketInfo(uint256 roundId, uint256 ticketId) external view returns (
    address buyer,
    bool claimed
)
```

### FHE Operations

The contract uses Zama's FHE library for encrypted operations:

```solidity
// Import FHE library (fhEVM v0.9.1)
import { FHE, euint32, ebool, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

// Convert external encrypted input to internal
euint32 cipherNumber = FHE.fromExternal(encryptedNumber, proof);

// Grant access permissions
FHE.allow(cipherNumber, msg.sender);
FHE.allowThis(cipherNumber);

// Compare encrypted number with winning number
euint32 winningCipher = FHE.asEuint32(round.plainWinningNumber);
ebool isWinner = FHE.eq(ticket.number, winningCipher);
```

## 🏗️ Technical Architecture

### Frontend Stack

```
┌─────────────────────────────────────────────────────┐
│                    Frontend Layer                    │
├─────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite                       │
│  - UI Framework: shadcn/ui + Tailwind CSS           │
│  - Routing: React Router v6                         │
│  - State Management: TanStack Query                 │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                  Web3 Integration                    │
├─────────────��───────────────────────────────────────┤
│  Wagmi v2 + RainbowKit + Viem                       │
│  - Wallet Connection                                │
│  - Transaction Management                           │
│  - Contract Interactions                            │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                   FHE Encryption                     │
├─────────────────────────────────────────────────────┤
│  Zama Relayer SDK (CDN-loaded)                      │
│  - Client-side encryption/decryption               │
│  - Zero-knowledge proof generation                  │
│  - euint32 encrypted type handling                  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                 Smart Contract Layer                 │
├─────────────────────────────────────────────────────┤
│  FHELottery Contract (Sepolia)                      │
│  - Zama fhEVM v0.9.1                                │
│  - Encrypted data storage                           │
│  - FHE operations on-chain                          │
└─────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI components and type safety |
| **Build Tool** | Vite | Fast development and bundling |
| **Styling** | Tailwind CSS + shadcn/ui | Modern, responsive design |
| **Web3** | Wagmi v2 + Viem | Ethereum interactions |
| **Wallet** | RainbowKit | Multi-wallet support |
| **FHE** | Zama Relayer SDK 0.3.0-5 | Client-side encryption |
| **Smart Contract** | Solidity + fhEVM 0.9.1 | On-chain logic with FHE |
| **Network** | Ethereum Sepolia | Testnet deployment |

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH (from faucet)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd LuckyDraw
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Start development server**

```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173`

### Environment Setup

No `.env` file is required for the frontend as all configuration is public (Sepolia testnet).

## 📦 Deployment Guide

### Frontend Deployment to Vercel

1. **Install Vercel CLI**

```bash
npm i -g vercel
```

2. **Login to Vercel**

```bash
vercel login
```

3. **Deploy to production**

```bash
# Deploy with custom name
vercel --prod --name luckydraw

# Set custom domain (after deployment)
vercel alias set <deployment-url> fhe-luckydraw.vercel.app
```

4. **Important Files**

- `.npmrc` - Contains `legacy-peer-deps=true` for dependency resolution
- `vercel.json` - SPA routing configuration to prevent 404 on refresh

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Smart Contract Deployment

The contract is already deployed on Sepolia. If you need to deploy your own:

1. **Install Hardhat**

```bash
npm install --save-dev hardhat
```

2. **Set environment variables**

```bash
export SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
export PRIVATE_KEY="your-private-key"
```

3. **Compile contracts**

```bash
npm run compile
```

4. **Deploy to Sepolia**

```bash
npm run deploy:sepolia
```

5. **Create initial rounds**

```bash
npx hardhat run scripts/create-round.cjs --network sepolia --config hardhat.config.cjs
```

## 🧪 Testing

### Smart Contract Unit Tests

The project includes comprehensive FHE smart contract tests using Hardhat and the FHEVM mock environment.

#### Run All Contract Tests

```bash
npm run test:contracts
```

#### Run Basic Functionality Tests

```bash
npm run test:contracts:basic
```

Tests include:
- Contract deployment and initialization
- Round creation (admin permissions, time validation)
- Ticket purchase with encrypted numbers
- Multi-user and multi-ticket scenarios
- Drawing winning numbers (time control, double-draw prevention)
- Prize claiming (verification, double-claim prevention)
- Access control for encrypted ticket numbers

#### Run Advanced FHE Operations Tests

```bash
npm run test:contracts:advanced
```

Tests include:
- `FHE.fromExternal()` - Encrypted input conversion
- `FHE.eq()` - Encrypted comparison for winner verification
- `FHE.asEuint32()` - Plaintext to ciphertext conversion
- `FHE.allow()` - User access permissions
- `FHE.allowThis()` - Contract self-access permissions
- Invalid proof handling
- Edge cases (zero values, max uint32 values)
- Multiple rounds with FHE operations
- Performance testing (rapid sequential operations)
- Complete lottery flow verification
- Event emission testing

### Frontend Unit Tests

Run frontend unit tests with:

```bash
npm run test
```

### Test File Structure

```
test/
├── FHELottery.test.js          # Basic functionality tests (22 test cases)
└── FHELottery.advanced.test.js # Advanced FHE operations tests (12 test cases)
```

### Manual Testing

1. **Connect Wallet**
   - Open http://localhost:5173
   - Click "Connect Wallet"
   - Approve connection in MetaMask

2. **Buy a Ticket**
   - Navigate to "Play Now" section
   - Enter 6 numbers (0-99)
   - Click "Buy & Encrypt Ticket"
   - Confirm transaction in wallet

3. **View Your Tickets**
   - Scroll to "My Tickets" section
   - Your encrypted tickets should appear
   - Click "Refresh" to update

4. **Check Past Rounds**
   - View "Past Rounds" section
   - See historical draws and winners

## 💡 How It Works

### User Flow

```
1. User Connects Wallet
        ↓
2. User Selects Numbers (0-99) × 6
        ↓
3. Numbers Encrypted Locally (FHE)
        ↓
4. Encrypted Numbers + Proof Sent to Contract
        ↓
5. Contract Stores Encrypted Ticket
        ↓
6. Admin Draws Winning Number at Draw Time
        ↓
7. User Checks if Their Ticket Won
        ↓
8. Winner Claims Prize
```

### Encryption Process

```javascript
// Client-side encryption
import { encryptNumber } from '@/lib/fhe';

const { encryptedNumber, proof } = await encryptNumber(
  combinedNumber,    // User's lottery number
  contractAddress,   // Smart contract address
  userAddress       // User's wallet address
);

// Send to blockchain
await contract.buyTicket(roundId, encryptedNumber, proof);
```

### Decryption Process

```javascript
// Only the user can decrypt their own numbers
const fhe = await initializeFHE();
const decrypted = await fhe.decrypt(
  contractAddress,
  ticketHandle,      // Encrypted ticket number handle
  userAddress
);
```

## 📁 Project Structure

```
LuckyDraw/
├── contracts/                  # Smart contracts
│   └── LuckyDraw.sol          # Main FHE lottery contract
├── scripts/                    # Deployment scripts
│   ├── deploy.cjs             # Contract deployment script
│   └── create-round.cjs       # Round creation script
├── test/                       # Unit tests
│   ├── FHELottery.test.js     # Basic functionality tests
│   └── FHELottery.advanced.test.js # Advanced FHE tests
├── src/
│   ├── components/            # React components
│   │   ├── Header.tsx        # Navigation header
│   │   ├── Hero.tsx          # Landing section
│   │   ├── CurrentRound.tsx  # Active round display
│   │   ├── BuyTicket.tsx     # Ticket purchase form
│   │   ├── MyTickets.tsx     # User tickets display
│   │   └── RoundHistory.tsx  # Past rounds history
│   ├── pages/                 # Page components
│   │   ├── Index.tsx         # Home page
│   │   ├── HowItWorks.tsx    # How It Works page
│   │   └── NotFound.tsx      # 404 page
│   ├── lib/                   # Utility libraries
│   │   ├── fhe.ts            # FHE encryption/decryption
│   │   ├── wagmi.ts          # Wagmi configuration
│   │   └── utils.ts          # Helper functions
│   ├── config/                # Configuration files
│   │   ├── contracts.ts      # Contract addresses & ABIs
│   │   └── brand.ts          # Branding constants
│   └── App.tsx               # Main app component
├── public/                    # Static assets
│   ├── logo.svg
│   └── test_demo.mp4
├── vercel.json               # Vercel deployment config
├── .npmrc                    # NPM configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite configuration
├── hardhat.config.cjs        # Hardhat configuration
└── README.md                 # This file
```

## 🔧 Key Files Explained

### `src/lib/fhe.ts`

Handles all FHE encryption and decryption operations:

```typescript
// Initialize FHE SDK
export async function initializeFHE(): Promise<any>

// Encrypt a lottery number
export const encryptNumber = async (
  number: number,
  contractAddress: string,
  userAddress: string
): Promise<{ encryptedNumber: `0x${string}`; proof: `0x${string}` }>

// Decrypt a lottery number
export const decryptNumber = async (
  handle: string,
  contractAddress: string,
  userAddress: string
): Promise<number>
```

### `src/config/contracts.ts`

Contract configuration and ABIs:

```typescript
export const CONTRACTS = {
  FHELottery: "0x1A13d8b13f11ac34d2c606d1c47117Fa9974bdAe" as `0x${string}`,
};

export const ABIS = {
  FHELottery: [...] // Full contract ABI
};
```

## 📚 Additional Resources

- [Zama Documentation](https://docs.zama.ai/)
- [fhEVM Documentation](https://docs.zama.ai/fhevm)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) for FHE technology
- [RainbowKit](https://www.rainbowkit.com/) for wallet integration
- [shadcn/ui](https://ui.shadcn.com/) for UI components

---

**Built with ❤️ using Fully Homomorphic Encryption**
