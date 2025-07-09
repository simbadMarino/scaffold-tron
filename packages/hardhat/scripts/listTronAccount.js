const QRCode = require("qrcode");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

async function listTronAccounts() {
  console.log("🔍 Checking your Tron accounts...\n");

  // Import TronWeb using the correct property (same as balance checker)
  let TronWeb;
  try {
    const tronWebModule = require("tronweb");
    TronWeb = tronWebModule.TronWeb || tronWebModule.default || tronWebModule;

    // Verify TronWeb is a constructor
    if (typeof TronWeb !== "function") {
      throw new Error("TronWeb is not a constructor function");
    }
  } catch (error) {
    console.log("❌ TronWeb import failed:", error.message);
    console.log("💡 Try running: yarn remove tronweb && yarn add tronweb@latest");
    return;
  }

  const networks = [
    {
      name: "Shasta Testnet",
      key: "TRON_PRIVATE_KEY_SHASTA",
      fullHost: "https://api.shasta.trongrid.io",
      explorer: "https://shasta.tronscan.org",
      faucet: "https://www.trongrid.io/shasta/",
    },
    {
      name: "Nile Testnet",
      key: "TRON_PRIVATE_KEY_NILE",
      fullHost: "https://api.nileex.io",
      explorer: "https://nile.tronscan.org",
      faucet: "https://nileex.io/join/getJoinPage",
    },
    {
      name: "Mainnet",
      key: "TRON_PRIVATE_KEY_MAINNET",
      fullHost: "https://api.trongrid.io",
      explorer: "https://tronscan.org",
      faucet: "Purchase TRX from exchange",
    },
    {
      name: "Development",
      key: "TRON_PRIVATE_KEY_DEV",
      fullHost: "http://localhost:9090",
      explorer: "http://localhost:9090",
      faucet: "Local testnet",
    },
  ];

  let foundAccounts = 0;

  console.log("📋 Your Tron Account Information:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (const network of networks) {
    const privateKey = process.env[network.key];

    if (!privateKey) {
      console.log(`❌ ${network.name}: No private key configured\n`);
      continue;
    }

    foundAccounts++;

    console.log(`🌐 ${network.name}:`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    try {
      // Initialize TronWeb to derive address (same method as balance checker)
      const tronWeb = new TronWeb({
        fullHost: network.fullHost,
        privateKey: privateKey,
      });

      // Derive the address from the private key using the same method as balance checker
      const address = tronWeb.address.fromPrivateKey(privateKey);

      // Generate QR code with the actual address
      try {
        const qrCode = await QRCode.toString(address, { type: "terminal", small: true });
        console.log(qrCode);
      } catch (qrError) {
        console.log("   [QR Code generation failed]");
      }

      // Display full account information
      console.log(`📱 Address: ${address}`);
      console.log(`🔐 Private Key: ${privateKey.substring(0, 6)}...${privateKey.substring(privateKey.length - 4)}`);
      console.log(`📱 Status: ✅ Configured`);
      console.log(`🔍 Explorer: ${network.explorer}`);

      if (network.name !== "Development" && network.name !== "Mainnet") {
        console.log(`🚰 Faucet: ${network.faucet}`);
      } else if (network.name === "Mainnet") {
        console.log(`💵 Funding: ${network.faucet}`);
      }

      console.log(""); // Empty line for spacing
    } catch (error) {
      console.log(`❌ Error deriving address: ${error.message}`);
      console.log(`🔐 Private Key: ${privateKey.substring(0, 6)}...${privateKey.substring(privateKey.length - 4)}`);
      console.log(`📱 Status: ⚠️  Configured but unable to derive address`);
      console.log(""); // Empty line for spacing
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (foundAccounts === 0) {
    console.log("⚠️  No Tron accounts found in your .env file");
    console.log("Run: yarn tron:setup to generate and configure accounts");
  } else {
    console.log(`✅ Found ${foundAccounts} configured Tron account(s)`);

    console.log("\n📋 Account Management:");
    console.log("• Full addresses are shown above with QR codes");
    console.log("• Import private keys into TronLink or another wallet");
    console.log("• Scan QR codes to import addresses into mobile wallets");

    console.log("\n🚀 Quick commands:");
    console.log("• yarn tron:setup          - Generate new accounts");
    console.log("• yarn tron:balance        - Check account balances");
    console.log("• yarn tron:compile        - Compile contracts");
    console.log("• yarn tron:deploy:testnet - Deploy to Shasta testnet");

    console.log("\n💡 Tips:");
    console.log("• Fund your testnet accounts before deploying");
    console.log("• Always test on testnet before mainnet");
    console.log("• Use yarn tron:balance to check funding status");
    console.log("• Copy addresses directly from the output above");
  }
}

// Run the function
listTronAccounts().catch(console.error);
