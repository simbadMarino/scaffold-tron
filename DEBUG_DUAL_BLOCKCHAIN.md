# Dual Blockchain Debug Interface

The Scaffold-ETH 2 debug interface now supports both **Ethereum** and **Tron** contracts! You can seamlessly switch between blockchains and interact with your deployed contracts on both networks.

## Features

### 🔄 Blockchain Switching

-   **Visual tabs** to switch between Ethereum (🔵) and Tron (🔴)
-   **Automatic network detection** and display
-   **Contract filtering** based on active blockchain
-   **Direct links** to block explorers for each network

### 📖 Contract Reading

-   **Unified interface** for reading from both Ethereum and Tron contracts
-   **Automatic parameter parsing** for function calls
-   **Real-time results** display
-   **Error handling** with user-friendly notifications

### ✍️ Contract Writing

-   **Transaction sending** for both blockchains
-   **Payable function support** with value input
-   **Gas/Energy fee management**
-   **Transaction receipts** and confirmation
-   **Loading states** during transaction processing

### 🏷️ Contract Identification

-   **TRX badges** for Tron contracts
-   **Network information** display
-   **Contract address** formatting for each blockchain
-   **Balance display** in native tokens (ETH/TRX)

## How to Use

### 1. Deploy Contracts

Deploy your contracts to both networks:

```bash
# Deploy to Ethereum (local or testnet)
yarn deploy

# Deploy to Tron networks
yarn tron:deploy:testnet   # For Shasta testnet
yarn tron:deploy:mainnet   # For Tron mainnet
```

### 2. Access Debug Interface

Navigate to `/debug` in your dApp to access the unified debug interface.

### 3. Switch Blockchains

Use the blockchain switcher tabs at the top:

-   **🔵 Ethereum** - Switch to Ethereum contracts
-   **🔴 Tron** - Switch to Tron contracts

### 4. Interact with Contracts

-   **Read Methods**: Call view/pure functions with parameters
-   **Write Methods**: Send transactions to modify contract state
-   **Variables**: View contract state variables automatically

## Architecture

### Unified Components

-   `DebugContracts` - Main container with blockchain switching
-   `ContractUI` - Contract interface supporting both blockchains
-   `ReadOnlyFunctionForm` - Unified read operations
-   `WriteOnlyFunctionForm` - Unified write operations

### Supporting Hooks

-   `useUnifiedContracts()` - Load contracts from both blockchains
-   `useUnifiedDeployedContractInfo()` - Contract deployment verification
-   `useActiveNetworkInfo()` - Current network information
-   `useUnifiedReadContract()` - Unified read operations
-   `useUnifiedWriteContract()` - Unified write operations

### Contract Data Sources

-   **Ethereum**: `deployedContracts.ts` (via Hardhat deployment)
-   **Tron**: `deployedTronContracts.ts` (via TronBox deployment)

## Network Support

### Ethereum Networks

-   Local Hardhat Network
-   Sepolia Testnet
-   Ethereum Mainnet
-   Other EVM-compatible networks

### Tron Networks

-   Shasta Testnet
-   Nile Testnet
-   Tron Mainnet

## Error Handling

The debug interface includes comprehensive error handling:

-   **Connection errors** - Wallet not connected
-   **Network errors** - Wrong network selected
-   **Contract errors** - Contract not deployed or invalid calls
-   **Transaction errors** - Failed transactions with detailed messages

## Tips

1. **Connect Wallets**: Ensure both MetaMask (Ethereum) and TronLink (Tron) are connected
2. **Network Matching**: The interface automatically detects network mismatches
3. **Contract Deployment**: Deploy contracts to intended networks before debugging
4. **Gas/Energy**: Monitor transaction fees for each blockchain
5. **Block Explorers**: Use the provided links to verify transactions

## Troubleshooting

### Contract Not Found

-   Verify contract deployment with `yarn deploy` or `yarn tron:deploy:testnet`
-   Check correct network selection in wallet
-   Ensure contract addresses in deployment files are correct

### Transaction Failures

-   Check wallet connection and network selection
-   Verify sufficient balance for gas/energy fees
-   Ensure function parameters are correct format
-   Check contract state requirements

### Reading Errors

-   Verify function exists and is public/external
-   Check parameter types and values
-   Ensure contract is deployed and accessible

This dual blockchain debug interface provides a powerful development experience for building cross-chain dApps with Scaffold-ETH 2!
