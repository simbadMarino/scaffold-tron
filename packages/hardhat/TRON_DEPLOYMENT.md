# Tron Deployment Guide

This guide explains how to deploy your Scaffold-ETH 2 contracts to the Tron network using TronBox.

## Setup Status ✅

✅ **TronBox Integration Complete**: TronBox has been successfully integrated into your Scaffold-ETH 2 project!

The following has been set up:

- ✅ TronBox dependencies installed
- ✅ TronBox configuration file created
- ✅ Tron-specific migration scripts created
- ✅ Test files created
- ✅ Compilation working
- ✅ Scripts added to package.json
- ✅ **NEW**: Automated .env setup script

## 🚀 Super Quick Start (One Command Setup!)

```bash
cd packages/hardhat
yarn tron:setup
```

This single command will:

- Generate 3 new Tron accounts (Shasta, Nile, Mainnet)
- Automatically add the private keys to your `.env` file
- Show you the addresses to fund with test TRX
- Prepare everything for deployment

## Quick Start (Manual)

1. **Install dependencies** (if not already done):

   ```bash
   cd packages/hardhat
   yarn install
   ```

2. **Generate Tron accounts and setup .env**:

   ```bash
   yarn tron:setup
   ```

3. **Fund your accounts** with test TRX using the addresses shown

4. **Deploy to testnet**:
   ```bash
   yarn tron:deploy:testnet
   ```

## Prerequisites

1. **Dependencies**: Already installed ✅
2. **Configuration**: Use `yarn tron:setup` to generate keys automatically ✅

## Available Networks

- **mainnet**: Tron Mainnet
- **shasta**: Tron Shasta Testnet (recommended for testing)
- **nile**: Tron Nile Testnet
- **development**: Local Tron node

## Getting Test TRX

The `yarn tron:setup` command will show you specific addresses to fund. For manual funding:

- **Shasta Testnet**: https://www.trongrid.io/shasta/
- **Nile Testnet**: https://nileex.io/join/getJoinPage

## Available Scripts

All scripts should be run from the `packages/hardhat` directory:

### Setup & Key Generation

```bash
yarn tron:setup          # Generate accounts and setup .env (recommended)
yarn tron:generate       # Generate new accounts (display only)
```

### Development

```bash
yarn tron:compile        # Compile contracts
yarn tron:test           # Run tests
yarn tron:console        # Open console
```

### Deployment

```bash
yarn tron:deploy:testnet # Deploy to Shasta testnet (recommended)
yarn tron:deploy:nile    # Deploy to Nile testnet
yarn tron:deploy:mainnet # Deploy to Mainnet (use with caution)
```

## Key Differences from Ethereum

1. **Energy vs Gas**: Tron uses "Energy" instead of "Gas"
2. **Address Format**: Tron addresses use base58 encoding (start with 'T')
3. **Currency**: TRX instead of ETH
4. **Block Explorers**:
   - Mainnet: https://tronscan.org
   - Shasta: https://shasta.tronscan.org
   - Nile: https://nile.tronscan.org

## Contract Compatibility

Your existing `YourContract.sol` is compatible with Tron with minimal changes:

- Remove `hardhat/console.sol` import when deploying to mainnet
- The contract uses standard Solidity features that work on both EVM and TVM

## Example Workflow

```bash
# 1. Setup everything automatically
yarn tron:setup

# 2. Fund your accounts using the addresses shown
# Go to https://www.trongrid.io/shasta/ and fund your Shasta address

# 3. Compile and deploy
yarn tron:compile
yarn tron:deploy:testnet

# 4. View your contract on explorer
# Go to https://shasta.tronscan.org and search for your contract address
```

## Example Deployment Output

After successful deployment, you'll see output like:

```
Running migration: 2_deploy_your_contract.js
  Deploying YourContract...
  YourContract: 41477f693ae6f691daf7d399ee61c32832c0314871
Saving successful migration to network...
```

## Security Features

- ✅ **Separate keys for each network** - Automated generation of different keys
- ✅ **Automatic .env management** - Keys are safely stored in .env file
- ✅ **Gitignore protection** - .env file is excluded from version control
- ✅ **Timestamped generation** - Each key generation is timestamped

## Troubleshooting

1. **Private Key Issues**: Run `yarn tron:setup` to regenerate keys
2. **Network Issues**: Ensure you have internet connection and the network URLs are accessible
3. **Insufficient Energy**: Make sure your account has enough TRX to cover deployment costs
4. **Compilation Issues**: Try `rm -rf build && yarn tron:compile` to clean and recompile

## Next Steps

After deployment, you can:

1. View your contract on the appropriate block explorer
2. Interact with it using TronWeb in your frontend
3. Test contract functions using the TronBox console

## File Structure

The integration has added the following files to your project:

```
packages/hardhat/
├── .env                          # Generated automatically with keys
├── tronbox.js                    # TronBox configuration
├── tron-migrations/              # Tron deployment scripts
│   ├── 1_initial_migration.js
│   └── 2_deploy_your_contract.js
├── tron-test/                    # Tron test files
│   └── YourContract.test.js
├── contracts/
│   └── Migrations.sol           # Migration contract for TronBox
├── scripts/
│   └── generateTronAccount.js   # Automated account generation
├── TRON_DEPLOYMENT.md           # This file
└── TRON_KEYS_SETUP.md          # Detailed key setup guide
```
