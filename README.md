# 🏗 Scaffold-TRON

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 A **dual-blockchain development toolkit** built with **Scaffold-ETH 2** for both **Ethereum** and **Tron** networks. This toolkit makes it easier for developers to create and deploy smart contracts on both blockchains and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, TronBox, TronWeb, and Typescript.

## ✨ Enhanced Features

### **Ethereum Support (Original)**

-   ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
-   🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
-   🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
-   🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
-   🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

### **Tron Support (New)**

-   🚀 **TronBox Integration**: Deploy smart contracts to Tron networks (Shasta, Nile, Mainnet)
-   🔑 **Account Management**: Automated Tron account generation with QR codes
-   💰 **Balance Checking**: Real-time TRX balance monitoring across networks
-   🧪 **Testnet Support**: Easy deployment and testing on Tron testnets
-   ⚡ **TVM Compatibility**: Leverage Tron Virtual Machine's EVM compatibility

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before you begin, you need to install the following tools:

-   [Node (>= v20.18.3)](https://nodejs.org/en/download/)
-   Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
-   [Git](https://git-scm.com/downloads)

## Quickstart

### 🚀 Initial Setup

1. Clone the repository:

```bash
git clone https://github.com/kmjones1979/scaffold-tron.git tron-dapp
```

2. Install dependencies:

```bash
cd tron-dapp
yarn install
```

### 🔷 Ethereum Development (Original Workflow)

3. Run a local Ethereum network:

```bash
yarn chain
```

4. Deploy Ethereum contracts:

```bash
yarn deploy
```

5. Start the NextJS frontend:

```bash
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page.

### 🔺 Tron Development (Enhanced Workflow)

#### Step 1: Generate Tron Accounts

Generate Tron accounts for all networks (includes QR codes for easy wallet import):

```bash
yarn tron:setup
```

This creates accounts for:

-   **Shasta Testnet** (primary for testing)
-   **Nile Testnet** (alternative testnet)
-   **Mainnet** (production)
-   **Development** (local)

#### Step 2: Fund Your Testnet Accounts

Get free TRX from faucets for testing:

**Shasta Testnet Faucets:**

-   [https://shasta.tronex.io/join/getJoinPage](https://shasta.tronex.io/join/getJoinPage) - Get 2000 test TRX
-   [https://www.trongrid.io/shasta/](https://www.trongrid.io/shasta/) - Alternative faucet

**Nile Testnet Faucet:**

-   [https://nileex.io/join/getJoinPage](https://nileex.io/join/getJoinPage)

Copy your Shasta testnet address from the setup output and request test TRX.

#### Step 3: Check Your Balances

```bash
yarn tron:balance
```

This shows real-time balances for all your Tron accounts.

#### Step 4: Compile Tron Contracts

```bash
yarn tron:compile
```

#### Step 5: Deploy to Tron Networks

**Deploy to Shasta Testnet:**

```bash
yarn tron:deploy:testnet
```

**Deploy to Nile Testnet:**

```bash
yarn tron:deploy:nile
```

**Deploy to Mainnet** (requires real TRX):

```bash
yarn tron:deploy:mainnet
```

#### Step 6: Run Tests

```bash
yarn tron:test
```

Tests run against the Shasta testnet to verify contract functionality.

## 📋 Available Scripts

### Ethereum Commands

-   `yarn chain` - Start local Ethereum network
-   `yarn deploy` - Deploy to local Ethereum network
-   `yarn start` - Start NextJS frontend
-   `yarn hardhat:test` - Run Ethereum contract tests

### Tron Commands

-   `yarn tron:setup` - Generate Tron accounts with QR codes
-   `yarn tron:account` - Display account information
-   `yarn tron:balance` - Check TRX balances across networks
-   `yarn tron:compile` - Compile contracts for Tron
-   `yarn tron:deploy:testnet` - Deploy to Shasta testnet
-   `yarn tron:deploy:nile` - Deploy to Nile testnet
-   `yarn tron:deploy:mainnet` - Deploy to Tron mainnet
-   `yarn tron:test` - Run Tron contract tests
-   `yarn tron:console` - Open TronBox console

## 🌐 Network Information

### Tron Networks

-   **Shasta Testnet**: Primary testing network

    -   Explorer: [https://shasta.tronscan.org](https://shasta.tronscan.org)
    -   Faucets: [Shasta Faucet 1](https://shasta.tronex.io/join/getJoinPage) | [Shasta Faucet 2](https://www.trongrid.io/shasta/)

-   **Nile Testnet**: Alternative testing network

    -   Explorer: [https://nile.tronscan.org](https://nile.tronscan.org)
    -   Faucet: [Nile Faucet](https://nileex.io/join/getJoinPage)

-   **Mainnet**: Production network
    -   Explorer: [https://tronscan.org](https://tronscan.org)
    -   Requires real TRX from exchanges

## 🏗️ Project Structure

```
tron-dapp/
├── packages/
│   ├── hardhat/                 # Ethereum & Tron smart contracts
│   │   ├── contracts/           # Solidity contracts (compatible with both chains)
│   │   ├── deploy/             # Ethereum deployment scripts
│   │   ├── tron-migrations/    # Tron deployment scripts
│   │   ├── test/               # Ethereum tests
│   │   ├── tron-test/          # Tron tests
│   │   ├── scripts/            # Utility scripts for Tron
│   │   ├── hardhat.config.ts   # Ethereum configuration
│   │   └── tronbox.js          # Tron configuration
│   └── nextjs/                 # Frontend application
│       ├── app/                # Next.js app router
│       ├── components/         # React components
│       ├── hooks/              # Custom React hooks
│       └── scaffold.config.ts  # Frontend configuration
```

## 🔧 Configuration Files

-   **Ethereum**: `packages/hardhat/hardhat.config.ts`
-   **Tron**: `packages/hardhat/tronbox.js`
-   **Frontend**: `packages/nextjs/scaffold.config.ts`
-   **Environment**: `packages/hardhat/.env` (auto-generated by setup)

## 💡 Development Tips

### For Ethereum Development:

-   Use `yarn chain` for local development
-   Deploy contracts with `yarn deploy`
-   Test with `yarn hardhat:test`

### For Tron Development:

-   Always fund testnet accounts before deploying
-   Use `yarn tron:balance` to check funding status
-   Test on Shasta testnet before mainnet deployment
-   Contract deployment costs ~50-100 TRX on testnets

### Dual-Blockchain Development:

-   Smart contracts are compatible with both Ethereum and Tron
-   Same Solidity code deploys to both networks
-   Use network-specific tools for deployment and testing

## 📚 Documentation & Resources

-   [Scaffold-ETH 2 Docs](https://docs.scaffoldeth.io) - Learn about the original framework
-   [Scaffold-ETH 2 Website](https://scaffoldeth.io) - Feature overview
-   [TronBox Documentation](https://developers.tron.network/docs/tronbox-user-guide) - Tron development toolkit
-   [TronWeb API](https://developers.tron.network/docs/tronweb-intro) - Tron JavaScript SDK
-   [Tron Developer Hub](https://developers.tron.network/) - Complete Tron development resources

## 🤝 Contributing

We welcome contributions to this enhanced Scaffold-ETH 2 + Tron integration!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.

## 🎯 What's Next?

1. **Deploy your contracts** to both Ethereum and Tron testnets
2. **Test extensively** using the provided test suites
3. **Build your frontend** using the existing Scaffold-ETH 2 components
4. **Go multi-chain** by deploying to production networks

Happy building! 🚀
