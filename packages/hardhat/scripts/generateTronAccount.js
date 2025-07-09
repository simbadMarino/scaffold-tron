const TronWeb = require("tronweb");
const fs = require("fs");
const path = require("path");

async function generateTronAccount() {
  console.log("🔑 Generating new Tron accounts...\n");

  // Generate 3 accounts for different networks
  const accounts = {
    shasta: TronWeb.utils.accounts.generateAccount(),
    nile: TronWeb.utils.accounts.generateAccount(),
    mainnet: TronWeb.utils.accounts.generateAccount(),
  };

  console.log("✅ New Tron Accounts Generated:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  Object.entries(accounts).forEach(([network, account]) => {
    console.log(`\n🌐 ${network.toUpperCase()} Network:`);
    console.log(`   Address:     ${account.address.base58}`);
    console.log(`   Private Key: ${account.privateKey}`);
  });

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Update .env file
  const envPath = path.join(__dirname, "..", ".env");
  let envContent = "";

  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
    console.log("\n📝 Found existing .env file, updating...");
  } else {
    console.log("\n📝 Creating new .env file...");
  }

  // Remove existing TRON keys if they exist
  const tronKeyRegex = /^TRON_PRIVATE_KEY_.*=.*$/gm;
  envContent = envContent.replace(tronKeyRegex, "");

  // Add TRON configuration section
  const tronConfig = `
# =============================================================================
# TRON CONFIGURATION - Generated on ${new Date().toISOString()}
# =============================================================================

# For Shasta Testnet (recommended for testing)
TRON_PRIVATE_KEY_SHASTA=${accounts.shasta.privateKey}

# For Nile Testnet (alternative testnet)
TRON_PRIVATE_KEY_NILE=${accounts.nile.privateKey}

# For Mainnet (use with caution - real TRX required)
TRON_PRIVATE_KEY_MAINNET=${accounts.mainnet.privateKey}

# Development/Local testing (optional)
TRON_PRIVATE_KEY_DEV=da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0
`;

  // Add the TRON config to the env content
  envContent = envContent.trim() + "\n" + tronConfig;

  // Write to .env file
  fs.writeFileSync(envPath, envContent);

  console.log("✅ Updated .env file with new Tron private keys!");

  console.log("\n🚰 Next steps - Fund your accounts:");
  console.log(`• Shasta Testnet: https://www.trongrid.io/shasta/`);
  console.log(`  Address: ${accounts.shasta.address.base58}`);
  console.log(`• Nile Testnet: https://nileex.io/join/getJoinPage`);
  console.log(`  Address: ${accounts.nile.address.base58}`);
  console.log(`• Mainnet: Purchase TRX and send to ${accounts.mainnet.address.base58}`);

  console.log("\n🚀 Ready to deploy:");
  console.log("• yarn tron:compile");
  console.log("• yarn tron:deploy:testnet");

  console.log("\n⚠️  IMPORTANT SECURITY NOTES:");
  console.log("• Your .env file contains private keys - keep it secure!");
  console.log("• Never commit your .env file to version control");
  console.log("• Make sure .env is in your .gitignore file");
  console.log("• These accounts need TRX to deploy contracts");

  return accounts;
}

// Run the function
generateTronAccount().catch(console.error);
