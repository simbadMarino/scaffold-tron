# 🔑 Tron Private Keys Setup Guide

## Generated Accounts Summary

I've generated 3 secure Tron accounts for you to use across different networks:

### Account 1 - Shasta Testnet (Recommended for testing)

- **Address**: `TMf8QHhgb6Cfmb7KfmHHaGoVjGkV6ZyzQs`
- **Private Key**: `4A272ED22BDDA32CFAD440B901D3B79F4C74F590E2B82BC7E788997C13301D08`

### Account 2 - Nile Testnet (Alternative testnet)

- **Address**: `TDDYFCaJvLguGVZ8Ktvj5Wz5LvTiM3i9e9`
- **Private Key**: `5D087A3358A0C7AEAC10178591E4154725836B8D711DA1A87DE64D684D4A49F2`

### Account 3 - Mainnet (Use with caution)

- **Address**: `TQA1R2NL7LbKpXBdqUuRw7Xw56QwB9JaEm`
- **Private Key**: `CBC26ABBCE347AA0F0E3D87F363E5281A2026A06D76BA4C1D2366A0C972FDC1F`

## 📝 Step-by-Step Setup

### 1. Create or Update your `.env` file

Add these lines to your `packages/hardhat/.env` file:

```bash
# =============================================================================
# TRON CONFIGURATION
# =============================================================================

# For Shasta Testnet (recommended for testing)
TRON_PRIVATE_KEY_SHASTA=4A272ED22BDDA32CFAD440B901D3B79F4C74F590E2B82BC7E788997C13301D08

# For Nile Testnet (alternative testnet)
TRON_PRIVATE_KEY_NILE=5D087A3358A0C7AEAC10178591E4154725836B8D711DA1A87DE64D684D4A49F2

# For Mainnet (use with caution - real TRX required)
TRON_PRIVATE_KEY_MAINNET=CBC26ABBCE347AA0F0E3D87F363E5281A2026A06D76BA4C1D2366A0C972FDC1F

# Development/Local testing (optional)
TRON_PRIVATE_KEY_DEV=da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0
```

### 2. Fund Your Accounts

Before deploying, you need to fund your accounts with TRX:

#### For Shasta Testnet:

1. Go to: https://www.trongrid.io/shasta/
2. Enter your address: `TMf8QHhgb6Cfmb7KfmHHaGoVjGkV6ZyzQs`
3. Click "Submit" to get free test TRX

#### For Nile Testnet:

1. Go to: https://nileex.io/join/getJoinPage
2. Enter your address: `TDDYFCaJvLguGVZ8Ktvj5Wz5LvTiM3i9e9`
3. Get free test TRX

#### For Mainnet:

- You need to purchase real TRX from an exchange
- Transfer it to: `TQA1R2NL7LbKpXBdqUuRw7Xw56QwB9JaEm`

### 3. Test Your Setup

After funding your accounts, test the configuration:

```bash
# Test compilation
yarn tron:compile

# Test deployment to testnet
yarn tron:deploy:testnet
```

## 🔐 Security Best Practices

- ✅ **Different keys for each network** - I've generated separate keys for better security
- ✅ **Never commit .env file** - Make sure `.env` is in your `.gitignore`
- ✅ **Test on testnet first** - Always test on Shasta before mainnet
- ✅ **Keep keys secure** - Never share your private keys
- ✅ **Backup your keys** - Store them securely offline

## 🎯 Quick Start Commands

```bash
# Generate new accounts (if needed)
yarn tron:generate

# Compile contracts
yarn tron:compile

# Deploy to Shasta testnet
yarn tron:deploy:testnet

# Run tests
yarn tron:test

# Open console
yarn tron:console
```

## 📋 Account Addresses for Reference

Copy these addresses to fund your accounts:

```
Shasta Testnet: TMf8QHhgb6Cfmb7KfmHHaGoVjGkV6ZyzQs
Nile Testnet:   TDDYFCaJvLguGVZ8Ktvj5Wz5LvTiM3i9e9
Mainnet:        TQA1R2NL7LbKpXBdqUuRw7Xw56QwB9JaEm
```

## 🚀 Ready to Deploy!

Once your `.env` file is set up and your accounts are funded, you can start deploying your contracts to Tron!

---

**⚠️ Remember**: Keep your private keys secure and never share them publicly!
