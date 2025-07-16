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
-   🔄 **Unified Components**: Address and balance components that work seamlessly with both Ethereum and Tron
-   📋 **Copy Functionality**: One-click copy for all address types with proper formatting
-   🔗 **Block Explorer Links**: Direct links to appropriate block explorers for each network

### **Configuration Management**

-   ⚙️ **Unified Network Config**: Configure both Ethereum and Tron networks in a single `scaffold.config.ts`
-   🌐 **Network Switching**: Easy switching between different Tron networks (Shasta, Nile, Mainnet)
-   🎯 **Target Network Selection**: Set your preferred Tron network just like Ethereum networks

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## 🔍 Tron vs Ethereum: Key Differences for Developers

Understanding the fundamental differences between Tron and Ethereum is crucial for effective dual-blockchain development. While both networks support smart contracts and use similar development tools, they have distinct characteristics that affect how you build and deploy applications.

### **🏗️ Network Architecture**

| Aspect         | Ethereum                | Tron                            |
| -------------- | ----------------------- | ------------------------------- |
| **Consensus**  | Proof of Stake (PoS)    | Delegated Proof of Stake (DPoS) |
| **Block Time** | ~12 seconds             | ~3 seconds                      |
| **TPS**        | ~15 transactions/second | ~2,000 transactions/second      |
| **Validators** | Unlimited validators    | 27 Super Representatives        |
| **Finality**   | Probabilistic           | Near-instant                    |

### **💰 Cost Structure**

**Ethereum:**

-   **Gas Model**: Pay gas fees in ETH for all operations
-   **Variable Costs**: Fees fluctuate based on network congestion
-   **Contract Deployment**: Can cost $50-500+ depending on network conditions

**Tron:**

-   **Energy/Bandwidth Model**: Three resource types:
    -   **TRX**: Native token for transactions
    -   **Energy**: Consumed by smart contract execution
    -   **Bandwidth**: Used for transaction data
-   **Free Daily Allowance**: Users get free bandwidth daily
-   **Predictable Costs**: More stable pricing, deployment typically costs 50-100 TRX (~$5-10)

### **📍 Address Formats**

```solidity
// Ethereum addresses (20 bytes, hexadecimal)
0x742d35Cc6634C0532925a3b8D9C24A8c9A4c7c7b

// Tron addresses (21 bytes, Base58 encoded)
T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb

// Both can be used interchangeably in smart contracts
// Tron also supports hex format internally
```

### **⚙️ Smart Contract Differences**

#### **Deployment & Execution**

**Ethereum:**

```solidity
// Standard deployment
contract MyContract {
    constructor() {
        // Initialization code
    }
}
```

**Tron:**

```solidity
// Same Solidity code, but different execution context
contract MyContract {
    constructor() {
        // Initialization - executed on TVM (Tron Virtual Machine)
    }

    // Tron-specific considerations:
    // - Lower gas costs for computation
    // - Different opcodes for some operations
    // - Energy instead of gas
}
```

#### **Key Technical Differences**

**1. Transaction Types**

-   **Ethereum**: Simple transactions and contract calls
-   **Tron**: 30+ transaction types (Transfer, TriggerSmartContract, CreateSmartContract, etc.)

**2. Resource Management**

```solidity
// Ethereum: Gas estimation
uint256 gasRequired = estimateGas(functionCall);

// Tron: Energy consumption is more predictable
// Energy cost depends on instruction complexity, not network congestion
```

**3. Built-in Functions**

```solidity
// Tron has additional built-in functions:
// - freeze/unfreeze for staking
// - vote for Super Representatives
// - energy and bandwidth queries
```

#### **Development Considerations**

**Solidity Compatibility:**

-   **Ethereum**: Latest Solidity versions (0.8.x)
-   **Tron**: TVM supports most Solidity features with some limitations:
    -   Some newer opcodes may not be available
    -   Different gas cost structure for operations
    -   Events and logs work similarly but with different indexing

**Testing Differences:**

```javascript
// Ethereum testing (Hardhat)
describe("Contract", function () {
    it("Should deploy and work", async function () {
        const contract = await MyContract.deploy();
        // Standard Web3.js/Ethers.js patterns
    });
});

// Tron testing (TronBox + TronWeb)
describe("Contract", function () {
    it("Should deploy and work", async function () {
        const contract = await tronWeb.contract().new({
            // TronWeb-specific deployment
        });
        // TronWeb has different API patterns
    });
});
```

### **🔧 Development Tools**

**Ethereum Ecosystem:**

-   **Hardhat/Foundry**: Development frameworks
-   **Web3.js/Ethers.js**: JavaScript libraries
-   **MetaMask**: Primary wallet integration
-   **Etherscan**: Block explorer

**Tron Ecosystem:**

-   **TronBox**: Development framework (similar to Truffle)
-   **TronWeb**: JavaScript library (similar to Web3.js)
-   **TronLink**: Primary wallet integration
-   **TronScan**: Block explorer

### **🌐 Network Selection**

**Ethereum Networks:**

```typescript
// scaffold.config.ts
targetNetworks: [
    chains.hardhat, // Local development
    chains.sepolia, // Testnet
    chains.mainnet, // Production
];
```

**Tron Networks:**

```typescript
// scaffold.config.ts
targetTronNetwork: tronShasta,  // Testnet
// targetTronNetwork: tronNile,    // Alternative testnet
// targetTronNetwork: tronMainnet, // Production
```

### **📊 Performance Characteristics**

**Ethereum:**

-   Higher security through decentralization
-   Slower transaction finality
-   More expensive operations
-   Larger developer ecosystem

**Tron:**

-   Faster transaction processing
-   Lower transaction costs
-   More centralized consensus
-   Growing DeFi ecosystem

### **🚀 Migration Considerations**

When porting contracts between networks:

1. **Gas → Energy**: Review resource consumption patterns
2. **Address handling**: Ensure proper address format conversion
3. **Event indexing**: May require adjustments for different explorers
4. **Wallet integration**: Different connection patterns (MetaMask vs TronLink)
5. **Testing**: Network-specific test patterns and tools

### **💡 Best Practices**

**For Dual-Chain Development:**

-   Write network-agnostic smart contracts when possible
-   Use Scaffold-TRON's unified components for consistent UX
-   Test thoroughly on both networks' testnets
-   Consider cost implications when choosing primary network
-   Implement proper error handling for network-specific features

**Performance Tips:**

-   **Ethereum**: Optimize for gas efficiency, batch operations
-   **Tron**: Leverage faster block times, utilize free bandwidth
-   **Both**: Use events for indexing, implement proper access controls

This dual-blockchain approach gives you the best of both worlds: Ethereum's security and ecosystem with Tron's speed and low costs!

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

### ⚙️ Configure Your Networks

3. Configure your target networks in `packages/nextjs/scaffold.config.ts`:

```typescript
const scaffoldConfig = {
    // Ethereum networks (existing)
    targetNetworks: [chains.hardhat],

    // Tron network (new!)
    // Available options:
    // - tronShasta: Shasta testnet (for development)
    // - tronNile: Nile testnet (for development)
    // - tronMainnet: Tron mainnet (for production)
    targetTronNetwork: tronShasta,

    // ... other config
};
```

### 🔷 Ethereum Development (Original Workflow)

4. Run a local Ethereum network:

```bash
yarn chain
```

5. Deploy Ethereum contracts:

```bash
yarn deploy
```

6. Start the NextJS frontend:

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

## 🎨 Enhanced UI Components

### **UnifiedAddress Component**

The `UnifiedAddress` component automatically detects and handles both Ethereum and Tron addresses:

```typescript
import { UnifiedAddress } from "~~/components/scaffold-eth";

// Works with both Ethereum (0x...) and Tron (T...) addresses
<UnifiedAddress
    address="T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"
    format="short"
    size="base"
/>;
```

**Features:**

-   ✅ **Auto-detection**: Automatically detects address type
-   📋 **Copy functionality**: One-click copy for all addresses
-   🔗 **Block explorer links**: Direct links to appropriate explorers
-   🎨 **Consistent styling**: Matches Ethereum address styling
-   📱 **Responsive design**: Works across all screen sizes

### **Network Configuration**

Configure your preferred Tron network in `scaffold.config.ts`:

```typescript
// For development
targetTronNetwork: tronShasta,

// For production
targetTronNetwork: tronMainnet,
```

The entire application will automatically use your configured network!

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
│       │   └── scaffold-eth/   # Enhanced components
│       │       ├── UnifiedAddress.tsx     # Unified address component
│       │       ├── UnifiedBalance.tsx     # Unified balance component
│       │       └── UnifiedConnectButton.tsx # Dual-blockchain connect button
│       ├── hooks/              # Custom React hooks
│       │   └── scaffold-eth/   # Enhanced hooks
│       │       ├── useTronReadContract.ts   # Tron contract reading
│       │       ├── useTronWriteContract.ts  # Tron contract writing
│       │       └── useUnifiedWriteContract.ts # Unified contract interactions
│       ├── services/           # Web3 services
│       │   └── web3/          # Web3 providers
│       │       ├── tronConfig.tsx          # Tron provider
│       │       └── unifiedWeb3Context.tsx  # Unified Web3 context
│       └── scaffold.config.ts  # Unified network configuration
```

## 🔧 Configuration Files

### **Main Configuration**

-   **Unified Config**: `packages/nextjs/scaffold.config.ts` - Configure both Ethereum and Tron networks
-   **Ethereum**: `packages/hardhat/hardhat.config.ts` - Ethereum-specific configuration
-   **Tron**: `packages/hardhat/tronbox.js` - Tron-specific configuration
-   **Environment**: `packages/hardhat/.env` - Auto-generated by setup

### **Network Configuration Example**

```typescript
// packages/nextjs/scaffold.config.ts
import {
    tronShasta,
    tronNile,
    tronMainnet,
} from "~~/utils/scaffold-eth/networks";

const scaffoldConfig = {
    // Ethereum networks
    targetNetworks: [chains.hardhat],

    // Tron network selection
    targetTronNetwork: tronShasta, // Easy to change!

    // Other configuration...
};
```

## 📊 Substreams

Substreams is a powerful blockchain data indexing technology that enables real-time and historical data extraction from TRON (and other blockchains). This toolkit includes TRON Foundational Modules that provide pre-built data extraction capabilities for TRON blockchain analysis, DeFi applications, and analytics.

### **🔍 What are Substreams?**

Substreams allow you to:

-   **Extract blockchain data** in real-time as blocks are produced
-   **Transform and filter** transaction data based on your requirements
-   **Build composable modules** that can be combined for complex data processing
-   **Stream data efficiently** with parallel processing and caching

### **🔑 Authentication Setup**

#### **1. StreamingFast API Authentication**

For streaming live blockchain data, you need a StreamingFast API key:

```bash
# Set your StreamingFast API key
export STREAMINGFAST_KEY="your-streamingfast-api-key-here"

# Create the authentication function
function sftoken {
  export SUBSTREAMS_API_TOKEN=$(curl https://auth.streamingfast.io/v1/auth/issue -s --data-binary '{"api_key":"'$STREAMINGFAST_KEY'"}' | jq -r .token)
  echo "Token set in SUBSTREAMS_API_TOKEN"
}

# Get authentication token
sftoken
```

**Get your StreamingFast API key from:**

-   [https://app.streamingfast.io/](https://app.streamingfast.io/) - Sign up for free tier

#### **2. Substreams Registry Authentication**

For publishing and downloading packages from substreams.dev:

```bash
# Login with your registry token
substreams registry login
# Paste your token when prompted

# Or set environment variable
export SUBSTREAMS_REGISTRY_TOKEN="your-registry-token-here"
```

**Get your registry token from:**

-   [https://substreams.dev/account](https://substreams.dev/account) - Generate API tokens

### **📦 Package Management**

#### **Option 1: Download Pre-built Package (Recommended)**

The fastest way to get started is downloading the official TRON Foundational Modules:

```bash
# Navigate to substreams directory
cd packages/substreams

# Download the official TRON foundational package
substreams pack tron-foundational@v0.1.2 -o bin/tron-foundational-v0.1.2.spkg

# Verify the package
substreams info bin/tron-foundational-v0.1.2.spkg
```

**Package Contents:**

-   **`map_transactions`** - Extracts all non-failed transactions with full details
-   **`index_transactions`** - Creates searchable transaction indices
-   **`filtered_transactions`** - Filters transactions by type, contract, or other parameters

#### **Option 2: Compile Locally**

For custom development or modifications:

```bash
# Install Rust and WASM target
rustup target add wasm32-unknown-unknown

# Install Substreams CLI
brew install streamingfast/tap/substreams

# Compile the local package
cd packages/substreams
substreams build

# Package the compiled module
substreams pack -o bin/my-custom-package.spkg
```

### **🧪 CLI Testing Examples**

#### **Basic Transaction Streaming**

```bash
# Authenticate first
sftoken

# Stream recent transactions (1 block from block 50M)
substreams run bin/tron-foundational-v0.1.2.spkg map_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s 50000000 -t +1

# Stream 10 blocks of data
substreams run bin/tron-foundational-v0.1.2.spkg map_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s 50000000 -t +10
```

**Expected Output:**

```json
{
  "transactions": [
    {
      "hash": "0xabc123...",
      "block_number": 50000000,
      "transaction_type": "TriggerSmartContract",
      "from_address": "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb",
      "to_address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
      "amount": "1000000",
      "gas_used": 65000,
      "events": [...]
    }
  ]
}
```

#### **Filtered Transaction Streaming**

```bash
# Filter only smart contract interactions
substreams run bin/tron-foundational-v0.1.2.spkg filtered_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s 50000000 -t +1 \
  -p filtered_transactions:"contract_type:TriggerSmartContract"

# Filter by specific contract address (USDT example)
substreams run bin/tron-foundational-v0.1.2.spkg filtered_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s 50000000 -t +1 \
  -p filtered_transactions:"contract_address:TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"

# Filter by transaction amount (transfers > 1000 TRX)
substreams run bin/tron-foundational-v0.1.2.spkg filtered_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s 50000000 -t +1 \
  -p filtered_transactions:"min_amount:1000000000"  # 1000 TRX in sun units
```

#### **Historical Data Analysis**

```bash
# Analyze a specific date range (block range for 2024-01-01)
substreams run bin/tron-foundational-v0.1.2.spkg map_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s 56000000 -t 56010000  # ~1 day of blocks

# Stream with output to file
substreams run bin/tron-foundational-v0.1.2.spkg map_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s 50000000 -t +100 \
  --output-file ./data/tron-transactions.jsonl
```

#### **Real-time Monitoring**

```bash
# Stream live data (no end block specified)
substreams run bin/tron-foundational-v0.1.2.spkg map_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s -1  # Start from latest block

# Monitor DeFi activity (JustSwap, SunSwap contracts)
substreams run bin/tron-foundational-v0.1.2.spkg filtered_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s -1 \
  -p filtered_transactions:"contract_type:TriggerSmartContract"
```

### **🔧 Common CLI Parameters**

| Parameter           | Description           | Example                                |
| ------------------- | --------------------- | -------------------------------------- |
| `-e, --endpoint`    | Substreams endpoint   | `mainnet.tron.streamingfast.io:443`    |
| `-s, --start-block` | Starting block number | `50000000` or `-1` (latest)            |
| `-t, --stop-block`  | Ending block number   | `+10` (10 blocks) or `50000100`        |
| `-p, --params`      | Module parameters     | `"contract_type:TriggerSmartContract"` |
| `--output-file`     | Save output to file   | `./data/output.jsonl`                  |
| `--output-format`   | Output format         | `json`, `jsonl`                        |

### **📊 Available TRON Endpoints**

| Network         | Endpoint                                | Description              |
| --------------- | --------------------------------------- | ------------------------ |
| **TRON Native** | `mainnet.tron.streamingfast.io:443`     | Full TRON protocol data  |
| **TRON EVM**    | `mainnet-evm.tron.streamingfast.io:443` | EVM-compatible data only |

### **🔍 Data Types You Can Extract**

**Transaction Types:**

-   `TransferContract` - Basic TRX transfers
-   `TriggerSmartContract` - Smart contract interactions (DeFi, tokens)
-   `TransferAssetContract` - TRC-10 token transfers
-   `CreateSmartContract` - Contract deployments
-   `FreezeBalanceContract` - Staking operations
-   `VoteWitnessContract` - Super Representative voting
-   And 24 more transaction types!

**Rich Data Fields:**

-   Transaction hashes and signatures
-   Gas/Energy consumption and costs
-   Contract addresses and function calls
-   Event logs and return values
-   Account balances and state changes
-   Network resource usage (bandwidth, energy)

### **🎯 Use Cases**

**DeFi Analytics:**

```bash
# Monitor DEX trading activity
substreams run bin/tron-foundational-v0.1.2.spkg filtered_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s -1 \
  -p filtered_transactions:"contract_type:TriggerSmartContract,contract_address:TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"
```

**Token Transfer Monitoring:**

```bash
# Track USDT transfers
substreams run bin/tron-foundational-v0.1.2.spkg filtered_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s -1 \
  -p filtered_transactions:"contract_address:TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
```

**Large Transaction Alerts:**

```bash
# Monitor whale transactions (>100,000 TRX)
substreams run bin/tron-foundational-v0.1.2.spkg filtered_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s -1 \
  -p filtered_transactions:"min_amount:100000000000"
```

### **📚 Additional Resources**

-   **Substreams Documentation**: [https://substreams.streamingfast.io/](https://substreams.streamingfast.io/)
-   **TRON Foundational Modules**: [https://substreams.dev/packages/tron-foundational](https://substreams.dev/packages/tron-foundational)
-   **StreamingFast Endpoints**: [https://substreams.streamingfast.io/reference-and-specs/chains-and-endpoints](https://substreams.streamingfast.io/reference-and-specs/chains-and-endpoints)
-   **TRON Protocol Docs**: [https://developers.tron.network/](https://developers.tron.network/)

### **🚨 Important Notes**

-   **Authentication Required**: Both StreamingFast API key and registry tokens are required
-   **Rate Limits**: Free tier has usage limits; check [StreamingFast pricing](https://streamingfast.io/pricing)
-   **Block Numbers**: TRON block numbers are different from Ethereum; current block ~57M+
-   **Data Costs**: Streaming large ranges consumes significant bandwidth
-   **Real-time vs Historical**: Historical data (older blocks) may have higher latency

## 🗄️ Database Integration & Real-time Data Pipeline

This section covers setting up a complete data pipeline from TRON substreams to a PostgreSQL database with GraphQL API access. You'll be able to stream real-time TRON transaction data, store it in a database, and query it through a modern GraphQL interface.

### **📋 Prerequisites**

Before setting up the database integration, ensure you have:

-   **Docker Desktop** installed and running
-   **StreamingFast API key** (see authentication section above)
-   **Node.js** and **yarn** installed
-   **Basic Docker and PostgreSQL knowledge**

### **🐳 Step 1: Docker Environment Setup**

#### **Start Docker Services**

Navigate to the substreams directory and start the database services:

```bash
# Navigate to substreams package
cd packages/substreams

# Start PostgreSQL and PostGraphile containers
docker-compose up -d

# Verify containers are running
docker ps
```

**Expected containers:**

-   `substreams-postgres-1` - PostgreSQL database
-   `substreams-postgraphile-1` - PostGraphile GraphQL API server

#### **Check Service Health**

```bash
# Test PostgreSQL connection
docker exec -it substreams-postgres-1 psql -U tron_user -d tron_transactions -c "SELECT version();"

# Test GraphQL API (should be on port 5001)
curl http://localhost:5001/graphql -H "Content-Type: application/json" -d '{"query":"{ __schema { queryType { name } } }"}'
```

### **🗃️ Step 2: Database Schema Setup**

The database schema is automatically created when Docker containers start. Here's what gets created:

#### **Database Structure**

```sql
-- Main transactions table
CREATE TABLE tron_transactions (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(128) NOT NULL,
    block_number BIGINT NOT NULL,
    block_timestamp TIMESTAMP NOT NULL,
    contract_type VARCHAR(50),
    contract_address VARCHAR(64),
    from_address VARCHAR(64),
    to_address VARCHAR(64),
    value DECIMAL(38,0),
    gas_used BIGINT,
    gas_price BIGINT,
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_contract_address ON tron_transactions(contract_address);
CREATE INDEX idx_block_number ON tron_transactions(block_number);
CREATE INDEX idx_block_timestamp ON tron_transactions(block_timestamp);
```

#### **Verify Schema**

```bash
# Check table structure
docker exec -it substreams-postgres-1 psql -U tron_user -d tron_transactions -c "\d tron_transactions"

# Check if tables exist
docker exec -it substreams-postgres-1 psql -U tron_user -d tron_transactions -c "\dt"
```

### **📡 Step 3: Stream Real TRON Data**

#### **Authenticate with StreamingFast**

```bash
# Set your StreamingFast API key
export STREAMINGFAST_KEY="your-streamingfast-api-key-here"

# Create authentication function
function sftoken {
  export SUBSTREAMS_API_TOKEN=$(curl https://auth.streamingfast.io/v1/auth/issue -s --data-binary '{"api_key":"'$STREAMINGFAST_KEY'"}' | jq -r .token)
  echo "Token set in SUBSTREAMS_API_TOKEN"
}

# Get authentication token
sftoken
```

#### **Stream Transaction Data**

Stream real TRON transactions and save to a JSON file:

```bash
# Stream USDT contract transactions (100 blocks of data)
substreams run https://spkg.io/tron-foundational-v0.1.2.spkg map_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s 55000000 -t +100 \
  --output-file /tmp/tron_output.json

# Or stream specific contract interactions
substreams run https://spkg.io/tron-foundational-v0.1.2.spkg map_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s 55000000 -t +10 \
  --output-file /tmp/tron_usdt_data.json
```

**Example output structure:**

```json
{
  "@data": {
    "transactions": [
      {
        "hash": "0x123...",
        "blockNumber": "0xd2f0c9",
        "blockTimestamp": "0x676...",
        "contractType": "TriggerSmartContract",
        "contractAddress": "0x41a614f803b6fd780986a42c78ec9c7f77e6ded13c",
        "fromAddress": "0x41...",
        "toAddress": "0x41...",
        "value": "0x0",
        "gasUsed": "0xfe74",
        "events": [...]
      }
    ]
  },
  "@block": {
    "number": 55000009,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### **🔄 Step 4: Process and Insert Data**

#### **Install Node.js Dependencies**

```bash
# Install PostgreSQL client for Node.js
npm install pg

# Verify installation
node -e "console.log('PostgreSQL client installed:', require('pg').version)"
```

#### **Process JSON Data**

Use the provided Node.js scripts to process and insert the streamed data:

```bash
# Process single JSON file
node scripts/process-json-fixed.js

# Or process a specific JSON file
node scripts/test-single.js
```

**The processing script will:**

1. Read the JSON file from `/tmp/tron_output.json`
2. Parse transaction data and convert hex values to decimal
3. Insert transactions into the PostgreSQL database
4. Handle duplicate transactions gracefully
5. Provide progress feedback

#### **Verify Data Insertion**

```bash
# Check record count
docker exec -it substreams-postgres-1 psql -U tron_user -d tron_transactions -c "SELECT COUNT(*) FROM tron_transactions;"

# View recent transactions
docker exec -it substreams-postgres-1 psql -U tron_user -d tron_transactions -c "SELECT transaction_hash, block_number, contract_type, value FROM tron_transactions ORDER BY block_number DESC LIMIT 5;"
```

### **🚀 Quick Start: Stream Data to Database**

For a streamlined development experience, use the built-in yarn commands:

```bash
# Clean database before demo (optional)
yarn substreams:cleandb

# Stream 500 blocks of TRON transactions directly to database (full data)
yarn substreams:streamdb

# Quick demo with 50 blocks (faster for demos)
yarn substreams:demo

# Or customize the parameters:
cd packages/substreams
substreams run ./tron-foundational-v0.1.2.spkg map_transactions \
  -s 55000200 -t +100 | node scripts/stream-direct-to-db.js
```

**Available Commands:**

-   `yarn substreams:cleandb` - Clean database (removes all transactions)
-   `yarn substreams:streamdb` - Stream 200 blocks (comprehensive data with memory optimization)
-   `yarn substreams:demo` - Stream 10 blocks (quick demo, memory efficient)

**Perfect Demo Flow:**

```bash
# 1. Clean the database
yarn substreams:cleandb

# 2. Stream fresh data (10 blocks for quick demo)
yarn substreams:demo

# 3. View results at http://localhost:3000/transactions
```

This will:

-   🔄 Stream transactions in real-time from the TRON blockchain
-   💾 Insert data directly into your PostgreSQL database
-   📊 Show progress with live transaction counts per block
-   🔍 Skip duplicates automatically (substreams may send duplicate data)
-   🧠 Use optimized memory management for large data streams
-   ⚡ Provide immediate access via GraphQL API

**Key Features:**

-   **Real-time streaming**: No intermediate files needed
-   **Memory optimized**: Enhanced buffer management and garbage collection
-   **Automatic deduplication**: Handles duplicate transactions gracefully using unique constraints
-   **Progress tracking**: Live updates showing inserted vs processed transactions
-   **Block-aware processing**: Tracks unique blocks and their transaction counts
-   **Error handling**: Robust error recovery and logging
-   **GraphQL integration**: Immediate access via http://localhost:5001/graphiql

**Understanding the Output:**

-   **Processed**: Total transactions seen (including duplicates from substreams)
-   **Inserted**: Actual new transactions added to database
-   **Blocks**: Number of unique blocks processed

**Example Output:**

```
✅ Connected to PostgreSQL database
🔄 Starting real-time TRON transaction processing...
🔍 Processing new block 55000100
🔍 Processing new block 55000101
📊 Progress: 50 inserted / 67 processed across 2 blocks
🔍 Processing new block 55000102
✅ Processing complete!
📊 Final stats: 245 inserted / 312 processed across 15 blocks
📦 Blocks processed: 55000100 - 55000115
```

### **🔍 Step 5: Query Data via GraphQL**

#### **Test GraphQL API**

```bash
# Get total transaction count
curl -X POST http://localhost:5001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ allTronTransactions { totalCount } }"}'

# Get recent transactions
curl -X POST http://localhost:5001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ allTronTransactions(first: 5, orderBy: BLOCK_NUMBER_DESC) { nodes { transactionHash blockNumber contractType value } } }"}'

# Filter by contract address (USDT example)
curl -X POST http://localhost:5001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ allTronTransactions(condition: { contractAddress: \"0x41a614f803b6fd780986a42c78ec9c7f77e6ded13c\" }, first: 10) { totalCount nodes { transactionHash fromAddress toAddress value } } }"}'
```

#### **GraphQL Schema Overview**

**Available queries:**

-   `allTronTransactions` - List all transactions with filtering and pagination
-   `tronTransaction(id: ID!)` - Get specific transaction by ID
-   `tronTransactionByTransactionHash(hash: String!)` - Get transaction by hash

**Common filters:**

-   `contractAddress` - Filter by smart contract address
-   `contractType` - Filter by transaction type
-   `blockNumber` - Filter by block number range
-   `blockTimestamp` - Filter by timestamp range

### **🎨 Step 6: Frontend Integration**

#### **Start the Frontend**

```bash
# Navigate to NextJS package
cd packages/nextjs

# Install dependencies (if not already done)
yarn install

# Start the development server
yarn dev
```

#### **View Transaction Data**

Visit `http://localhost:3000/transactions` to see your real TRON transaction data displayed in a modern interface.

**Features available:**

-   ✅ **Real-time transaction display** from your database
-   ✅ **Contract address filtering** (supports both hex and base58 formats)
-   ✅ **Address components** that link to TronScan explorer
-   ✅ **Responsive design** with proper formatting
-   ✅ **Pagination** for large datasets
-   ✅ **Search functionality** by contract address

#### **Test Contract Filtering**

Try filtering by known contract addresses:

**USDT (Tether) Contract:**

-   **Hex format**: `0x41a614f803b6fd780986a42c78ec9c7f77e6ded13c`
-   **Base58 format**: `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`

**USDC Contract:**

-   **Base58 format**: `TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8`

### **⚡ Step 7: Real-time Data Streaming**

#### **Continuous Data Pipeline**

For continuous real-time data streaming, use the provided streaming script:

```bash
# Stream live data to database
node scripts/stream-to-db.js

# Or stream specific contract data
FILTER_CONTRACT="0x41a614f803b6fd780986a42c78ec9c7f77e6ded13c" node scripts/stream-to-db.js
```

#### **Automated Pipeline Setup**

Create a systemd service or Docker container for continuous operation:

```bash
# Example systemd service file
cat << 'EOF' > /etc/systemd/system/tron-stream.service
[Unit]
Description=TRON Substreams Data Pipeline
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/tron-dapp/packages/substreams
ExecStart=/usr/bin/node scripts/stream-to-db.js
Restart=always
RestartSec=10
Environment=STREAMINGFAST_KEY=your-api-key
Environment=SUBSTREAMS_API_TOKEN=your-token

[Install]
WantedBy=multi-user.target
EOF
```

### **🚨 Troubleshooting**

#### **Common Issues**

**1. Docker Connection Issues**

```bash
# Restart Docker services
docker-compose down
docker-compose up -d

# Check Docker logs
docker-compose logs postgres
docker-compose logs postgraphile
```

**2. Database Connection Errors**

```bash
# Reset database
docker-compose down -v  # Warning: This deletes all data!
docker-compose up -d

# Check database logs
docker logs substreams-postgres-1
```

**3. GraphQL API Issues**

```bash
# Check if PostGraphile is running
curl http://localhost:5001/

# Restart PostGraphile
docker-compose restart postgraphile
```

**4. Data Processing Errors**

```bash
# Check JSON file format
head -n 5 /tmp/tron_output.json

# Verify database schema
docker exec -it substreams-postgres-1 psql -U tron_user -d tron_transactions -c "\d tron_transactions"
```

### **📊 Data Analysis Examples**

#### **SQL Queries for Analysis**

```sql
-- Top contracts by transaction count
SELECT contract_address, COUNT(*) as tx_count
FROM tron_transactions
WHERE contract_address IS NOT NULL
GROUP BY contract_address
ORDER BY tx_count DESC
LIMIT 10;

-- Daily transaction volume
SELECT DATE(block_timestamp) as date, COUNT(*) as transactions
FROM tron_transactions
GROUP BY DATE(block_timestamp)
ORDER BY date DESC;

-- Large value transfers (>1000 TRX)
SELECT transaction_hash, from_address, to_address, value
FROM tron_transactions
WHERE value > 1000000000
ORDER BY value DESC
LIMIT 20;
```

#### **GraphQL Analysis Queries**

```graphql
# Get transaction statistics
query TransactionStats {
    allTronTransactions {
        totalCount
        nodes {
            blockNumber
            contractType
            value
        }
    }
}

# Contract interaction analysis
query ContractAnalysis($contractAddr: String!) {
    allTronTransactions(
        condition: { contractAddress: $contractAddr }
        orderBy: BLOCK_TIMESTAMP_DESC
    ) {
        totalCount
        nodes {
            transactionHash
            blockTimestamp
            fromAddress
            toAddress
            value
        }
    }
}
```

### **🔧 Configuration Options**

#### **Environment Variables**

```bash
# Substreams configuration
export STREAMINGFAST_KEY="your-api-key"
export SUBSTREAMS_API_TOKEN="your-token"

# Database configuration
export POSTGRES_USER="tron_user"
export POSTGRES_PASSWORD="secure_password"
export POSTGRES_DB="tron_transactions"
export POSTGRES_PORT="5432"

# API configuration
export GRAPHQL_PORT="5001"
export FRONTEND_PORT="3000"
```

#### **Docker Compose Customization**

Edit `packages/substreams/docker-compose.yml` to customize:

-   Database credentials
-   Port mappings
-   Volume mounts
-   Resource limits

### **🎯 Next Steps**

1. **Set up monitoring** with Grafana/Prometheus for production use
2. **Implement data retention policies** for managing database size
3. **Add data validation** and error handling for production stability
4. **Create custom substreams modules** for specific use cases
5. **Build analytics dashboards** on top of the GraphQL API
6. **Implement real-time alerts** for specific transaction patterns

### **💡 Pro Tips**

-   **Start with small block ranges** when testing to avoid rate limits
-   **Use contract address filters** to reduce data volume and costs
-   **Monitor database disk usage** as transaction data grows quickly
-   **Implement proper error handling** for production deployments
-   **Cache frequently accessed data** to improve API performance
-   **Use indexes** on commonly queried fields for better performance

This complete pipeline gives you real-time access to TRON blockchain data with modern tooling and APIs! 🚀

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

### For Substreams Development:

-   **Start with pre-built packages** before creating custom modules
-   **Test with small block ranges** first (`-t +1` or `-t +10`)
-   **Use filtering** to reduce data volume and costs
-   **Monitor rate limits** on free tier accounts
-   **Authenticate properly** before streaming data

### Dual-Blockchain Development:

-   Smart contracts are compatible with both Ethereum and Tron
-   Same Solidity code deploys to both networks
-   Use network-specific tools for deployment and testing
-   Configure target networks in `scaffold.config.ts`
-   Use `UnifiedAddress` component for consistent address display

### **UI/UX Best Practices:**

-   Use `UnifiedAddress` instead of `Address` for better Tron support
-   Configure your preferred Tron network in scaffold config
-   Test address copying and block explorer links
-   Ensure proper network switching in your dApp

## 🆕 Latest Enhancements

### **December 2024 Updates:**

-   🎨 **Rebranded to Scaffold-TRON** with proper Scaffold-ETH attribution
-   ⚙️ **Unified Configuration**: Configure Tron networks in `scaffold.config.ts`
-   🔄 **Enhanced Components**: Improved UnifiedAddress with copy functionality and block explorer links
-   📱 **Better UX**: Consistent address formatting and interaction patterns
-   🏗️ **Component Renaming**: Updated internal component names for consistency
-   🌐 **Network Utilities**: Added `getTargetTronNetwork()` utility function

## 📚 Documentation & Resources

-   [Scaffold-ETH 2 Docs](https://docs.scaffoldeth.io) - Learn about the original framework
-   [Scaffold-ETH 2 Website](https://scaffoldeth.io) - Feature overview
-   [TronBox Documentation](https://developers.tron.network/docs/tronbox-user-guide) - Tron development toolkit
-   [TronWeb API](https://developers.tron.network/docs/tronweb-intro) - Tron JavaScript SDK
-   [Tron Developer Hub](https://developers.tron.network/) - Complete Tron development resources

## 🤝 Contributing

We welcome contributions to Scaffold-TRON!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.

## 🎯 What's Next?

1. **Configure your networks** in `scaffold.config.ts`
2. **Deploy your contracts** to both Ethereum and Tron testnets
3. **Test extensively** using the provided test suites
4. **Build your frontend** using the enhanced Scaffold-TRON components
5. **Go multi-chain** by deploying to production networks

Happy building! 🚀

---

_Built with ❤️ on [Scaffold-ETH 2](https://scaffoldeth.io)_
