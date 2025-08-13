# 🔑 Tron Private Keys Setup Guide


## 📝 Step-by-Step Setup

### 1. Create or Update your `.env` file

Add these lines to your `packages/tronbox/.env` file:

```bash
# =============================================================================
# TRON CONFIGURATION
# =============================================================================

# For Shasta Testnet (recommended for testing)
TRON_PRIVATE_KEY_SHASTA='your private key here'

# For Nile Testnet (alternative testnet)
TRON_PRIVATE_KEY_NILE='your private key here'

# For Mainnet (use with caution - real TRX required)
TRON_PRIVATE_KEY_MAINNET='your private key here'

# Development/Local testing (optional)
TRON_PRIVATE_KEY_DEV='your private key here'
```

### 2. Fund Your Accounts

Before deploying, you need to fund your accounts with TRX:

#### For Shasta Testnet:

1. Go to: https://www.trongrid.io/shasta/
2. Enter your address
3. Click "Submit" to get free test TRX

#### For Nile Testnet:

1. Go to: https://nileex.io/join/getJoinPage
2. Enter your address
3. Get free test TRX

#### For Mainnet:

- You need to purchase real TRX from an exchange

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

## 📋 🚀 Ready to Deploy!

Once your `.env` file is set up and your accounts are funded, you can start deploying your contracts to Tron!

---

**⚠️ Remember**: Keep your private keys secure and never share them publicly!
