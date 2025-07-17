# Dual-Blockchain Frontend Setup: Ethereum + Tron

I've successfully integrated Tron support into your Scaffold-ETH 2 frontend, creating a dual-blockchain dApp that can interact with both Ethereum and Tron networks. Here's what has been implemented:

## 🎯 What's Been Built

### 1. **Tron Infrastructure**

-   **TronWeb Integration**: Added TronWeb v6.0.0 for Tron blockchain interactions
-   **TronLink Wallet Support**: Full integration with TronLink wallet
-   **Tron Networks**: Support for Shasta testnet, Nile testnet, and Tron mainnet
-   **Type Definitions**: Complete TypeScript definitions for TronWeb and TronLink

### 2. **Dual-Blockchain Providers**

-   **TronProvider**: Manages Tron wallet connections and network state
-   **UnifiedWeb3Provider**: Provides unified interface for both Ethereum and Tron
-   **Provider Hierarchy**: Properly nested providers for clean state management

### 3. **Tron Contract Interaction Hooks**

-   **useTronReadContract**: Read from Tron smart contracts (mirrors useScaffoldReadContract)
-   **useTronWriteContract**: Write to Tron smart contracts (mirrors useScaffoldWriteContract)
-   **Unified Hooks**: Automatically switch between Ethereum and Tron based on active blockchain

### 4. **Enhanced UI Components**

-   **TronConnectButton**: Toggle between Ethereum and Tron with blockchain switcher
-   **Dual Status Display**: Shows connection status for both blockchains
-   **Updated Header**: Seamlessly integrates both wallet types

### 5. **Configuration Files**

-   **deployedTronContracts.ts**: Tron contract addresses and ABIs
-   **Tron Networks**: Complete network definitions with explorers and faucets
-   **Updated Scaffold Config**: Extended to support both blockchains

## 📁 New Files Created

```
packages/nextjs/
├── services/web3/
│   ├── tronConfig.tsx              # Tron provider and configuration
│   └── unifiedWeb3Context.tsx     # Unified blockchain context
├── hooks/scaffold-eth/
│   ├── useTronReadContract.ts      # Tron read contract hook
│   ├── useTronWriteContract.ts     # Tron write contract hook
│   ├── useUnifiedReadContract.ts   # Unified read contract hook
│   └── useUnifiedWriteContract.ts  # Unified write contract hook
├── components/scaffold-eth/
│   └── TronConnectButton.tsx    # Dual-blockchain connect button
├── contracts/
│   └── deployedTronContracts.ts    # Tron contract configuration
├── types/
│   └── tronweb.d.ts               # TronWeb TypeScript definitions
└── utils/scaffold-eth/
    └── networks.ts                 # Updated with Tron networks
```

## 🔧 How It Works

### Network Configuration

```typescript
// Tron Networks
export const tronShasta = {
    id: 2494104990,
    name: "Tron Shasta Testnet",
    nativeCurrency: { name: "TRX", symbol: "TRX", decimals: 6 },
    rpcUrls: { default: { http: ["https://api.shasta.trongrid.io"] } },
    blockExplorers: {
        default: { name: "Shasta Scan", url: "https://shasta.tronscan.org" },
    },
    testnet: true,
};
```

### Tron Contract Configuration

```typescript
const deployedTronContracts = {
  2494104990: { // Shasta Testnet
    YourContract: {
      address: "THHrvDG92VzpXg2arnYyFC3EZD8DMEdr49",
      abi: [...] // Same ABI as Ethereum version
    },
  },
};
```

### Reading from Contracts

```typescript
// Tron-specific
const { data: tronGreeting } = useTronReadContract({
    contractName: "YourContract",
    functionName: "greeting",
});

// Unified (automatically switches based on active blockchain)
const { data: greeting } = useUnifiedReadContract({
    contractName: "YourContract",
    functionName: "greeting",
});
```

### Writing to Contracts

```typescript
// Tron-specific
const { writeContractAsync } = useTronWriteContract({
    contractName: "YourContract",
});

await writeContractAsync({
    functionName: "setGreeting",
    args: ["Hello Tron!"],
    callValue: 0.1, // Send 0.1 TRX
});

// Unified
const { writeContractAsync } = useUnifiedWriteContract({
    contractName: "YourContract",
});

await writeContractAsync({
    functionName: "setGreeting",
    args: ["Hello World!"],
    callValue: 0.1, // For Tron
    value: parseEther("0.1"), // For Ethereum
});
```

## 🌐 UI Features

### 1. **Blockchain Switcher**

-   Toggle between ETH and TRX in the header
-   Automatic provider switching
-   Network-specific displays

### 2. **Connection Status**

-   Real-time connection status for both blockchains
-   Balance display (TRX balance shown)
-   Contract interaction results for both networks

### 3. **Wallet Integration**

-   **Ethereum**: RainbowKit integration (MetaMask, WalletConnect, etc.)
-   **Tron**: TronLink integration with automatic detection

## 🚀 Usage Instructions

### 1. **Install TronLink**

-   Download TronLink extension from [tronlink.org](https://www.tronlink.org/)
-   Create or import a Tron wallet
-   Switch to Shasta Testnet for testing

### 2. **Get Test TRX**

Visit these faucets to get test TRX:

-   [Shasta Faucet 1](https://shasta.tronex.io/join/getJoinPage)
-   [Shasta Faucet 2](https://www.trongrid.io/shasta/)

### 3. **Deploy Your Contract to Tron**

```bash
# Use the existing Tron deployment commands
yarn tron:deploy:testnet
```

### 4. **Update Contract Address**

Update the deployed address in `packages/nextjs/contracts/deployedTronContracts.ts`:

```typescript
2494104990: { // Shasta Testnet
  YourContract: {
    address: "YOUR_DEPLOYED_ADDRESS_HERE",
    abi: [...]
  },
}
```

### 5. **Start the Frontend**

```bash
yarn start
```

## 🔍 Testing the Integration

1. **Load the App**: Visit `http://localhost:3000`
2. **Connect Ethereum Wallet**: Use the ETH tab to connect MetaMask
3. **Switch to Tron**: Click the TRX tab in the header
4. **Connect TronLink**: Click "Connect TronLink" button
5. **Test Contract Interactions**: Use the Debug page to interact with contracts on both networks

## 🎨 UI Components Overview

### TronConnectButton

-   Blockchain selector tabs (ETH/TRX)
-   Ethereum: Shows RainbowKit connection
-   Tron: Shows TronLink connection with balance and address

### Home Page

-   Connection status for both blockchains
-   Live contract reading from both networks
-   Clear indication of active blockchain

### Debug Page

-   Works with existing Scaffold-ETH debug interface
-   Automatically uses the correct blockchain based on selection

## 🔧 Advanced Features

### 1. **Provider Context**

```typescript
const {
    activeBlockchain, // "ethereum" | "tron"
    setActiveBlockchain, // Switch between blockchains
    activeAccount, // Current active account address
    isConnected, // Connection status for active blockchain
    activeBalance, // Balance for active account
} = useUnifiedWeb3();
```

### 2. **Tron-Specific Features**

```typescript
const {
    tronWeb, // TronWeb instance
    account, // Tron account with balance
    network, // Current Tron network
    connect, // Connect to TronLink
    switchNetwork, // Switch Tron networks
} = useTron();
```

## 🐛 Known Issues & Solutions

### 1. **TronWeb TypeScript Issues**

-   **Solution**: Type definitions have been added in `types/tronweb.d.ts`
-   **Fallback**: Use `as any` for complex TronWeb operations

### 2. **Contract Address Format**

-   **Ethereum**: Hex format (0x...)
-   **Tron**: Base58 format (T...)
-   **Solution**: Contracts are configured separately for each network

### 3. **Transaction Confirmation**

-   **Ethereum**: Uses wagmi's built-in transaction watching
-   **Tron**: Manual polling for transaction confirmation (30-second timeout)

## 🚀 Next Steps

1. **Test the Integration**: Connect both wallets and verify functionality
2. **Deploy to Production**: Update contract addresses for mainnet
3. **Add More Features**:
    - Transaction history
    - Multi-token support
    - Cross-chain bridging
4. **UI Enhancements**:
    - Better loading states
    - Error handling
    - Network switching prompts

## 📚 Resources

-   [TronWeb Documentation](https://developers.tron.network/docs/tronweb-intro)
-   [TronLink Integration Guide](https://developers.tron.network/docs/tronlink-integration)
-   [Tron Developer Hub](https://developers.tron.network/)
-   [Shasta Testnet Explorer](https://shasta.tronscan.org/)

Your Scaffold-ETH 2 project now supports both Ethereum and Tron! The infrastructure is in place for a truly multi-chain dApp. 🎉
