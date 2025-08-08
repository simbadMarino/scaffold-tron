# Tron Contract Deployment Guide

This guide will help you deploy your contracts to Tron testnets and update your frontend configuration.

## Prerequisites

1. **Install TronLink Wallet**: Download from [TronLink](https://www.tronlink.org/)
2. **Get Testnet TRX**: You'll need TRX to pay for deployment gas fees
3. **Compile Your Contract**: Make sure your contract is compiled with Hardhat

## Step 1: Get Testnet TRX

### Shasta Testnet (Recommended for testing)

- Visit: [https://www.trongrid.io/shasta](https://www.trongrid.io/shasta)
- Enter your TronLink wallet address
- Request testnet TRX (you'll get 10,000 TRX)

### Nile Testnet (Alternative)

- Visit: [https://nile.tronscan.org/](https://nile.tronscan.org/)
- Use the faucet to get testnet TRX

## Step 2: Set Up Your Private Key

⚠️ **NEVER use your mainnet private key for testing!**

### Export Private Key from TronLink

1. Open TronLink wallet
2. Go to Settings > Export Private Key
3. Copy your private key (for testnet accounts only)

### Set Environment Variable


Create a `.env.local` file in the `packages/nextjs` directory:

```bash
cp .env.example .env
```

## Step 3: Compile Your Contract



Make sure your contract is compiled:

```bash
cd packages/hardhat
yarn hardhat compile
```

## Step 4: Deploy to Tron Testnet

### Deploy to Shasta Testnet

```bash
yarn tron:deploy:testnet
# or specifically
yarn tron:deploy:shasta
```

### Deploy to Nile Testnet

```bash
yarn tron:deploy:nile
```

### Expected Output

```
🚀 Deploying to shasta...
📝 Contract ABI and bytecode loaded
👤 Deployer address: TYourTronAddress...
💰 Balance: 9999.5 TRX
🔧 Deploying contract...
✅ Contract deployed successfully!
📍 Contract address: TContractAddress...
🔗 View on explorer: https://shasta.tronscan.org/#/address/TContractAddress...
📄 Updated deployments file: tron-deployments.json
🔄 Run: yarn generate:tron-contracts to update the frontend
```

## Step 5: Update Frontend Configuration

After successful deployment, update your frontend:

```bash
yarn generate:tron-contracts
```

This will:

- Read your deployment from `tron-deployments.json`
- Update `contracts/deployedTronContracts.ts`
- Make your contract available in the debug interface

## Step 6: Test in Debug Interface

1. Start your frontend: `yarn start`
2. Go to `http://localhost:3000/debug`
3. Click the "TRX" tab to switch to Tron mode
4. Connect your TronLink wallet
5. Select the Shasta testnet in TronLink
6. You should see your deployed contract!

## Manual Contract Configuration

If you want to manually add a contract address, edit `packages/nextjs/contracts/deployedTronContracts.ts`:

```typescript
const deployedTronContracts = {
  // Shasta Testnet (chainId: 2494104990)
  2494104990: {
    YourContract: {
      address: "TYourContractAddress", // Replace with your address
      abi: yourContractAbi,
      inheritedFunctions: {},
    },
  },
  // ... other networks
};
```

## Troubleshooting

### "TronWeb is not a constructor"

- Make sure you have the TronLink extension installed
- Try refreshing the page
- Check browser console for more details

### "TRON_PRIVATE_KEY not set"

- Make sure you've exported the environment variable
- Check that your private key is correct (64 characters)
- Don't include the "0x" prefix

### "Insufficient balance"

- Get more testnet TRX from the faucet
- Make sure you're using the correct testnet
- Check your wallet balance

### "Contract artifacts not found"

- Run `yarn hardhat compile` first
- Make sure your contract is in `packages/hardhat/contracts/`

### "No contracts found!" in debug interface

- Make sure you've run `yarn generate:tron-contracts`
- Check that your deployment was successful
- Verify the contract address in `tron-deployments.json`

## Network Information


| Network | Chain ID   | RPC URL                        | Explorer                    |
| ------- | ---------- | ------------------------------ | --------------------------- |
| Shasta  | 2494104990 | https://api.shasta.trongrid.io | https://shasta.tronscan.org |
| Nile    | 3448148188 | https://nile.trongrid.io       | https://nile.tronscan.org   |
| Mainnet | 728126428  | https://api.trongrid.io        | https://tronscan.org        |

## Next Steps

1. **Test Your Contract**: Use the debug interface to interact with your contract
2. **Deploy to Mainnet**: When ready, use real TRX and deploy to mainnet
3. **Update Frontend**: Configure your production frontend with mainnet addresses
4. **Monitor**: Use TronScan to monitor your contract's activity

## Security Notes

- Never commit private keys to version control
- Use environment variables for sensitive data
- Test thoroughly on testnets before mainnet deployment
- Consider using a hardware wallet for mainnet deployments
