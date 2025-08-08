const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

async function checkTronBalance() {
  console.log("💰 Checking Tron Account Balances...\n");

  // Import TronWeb using the correct property
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
    },
  ];

  for (const network of networks) {
    const privateKey = process.env[network.key];

    if (!privateKey) {
      console.log(`❌ ${network.name}: No private key configured`);
      continue;
    }

    console.log(`🌐 ${network.name}:`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    try {
      // Initialize TronWeb with proper constructor
      const tronWeb = new TronWeb({
        fullHost: network.fullHost,
        privateKey: privateKey,
      });

      // Get address from private key
      const address = tronWeb.address.fromPrivateKey(privateKey);
      console.log(`📱 Address: ${address}`);

      // Get balance
      const balance = await tronWeb.trx.getBalance(address);
      const balanceInTrx = tronWeb.fromSun(balance);

      console.log(`💰 Balance: ${balanceInTrx} TRX`);

      if (parseFloat(balanceInTrx) === 0) {
        console.log("⚠️  No balance found!");
        if (network.faucet) {
          console.log(`🚰 Get free TRX: ${network.faucet}`);
        }
      } else if (parseFloat(balanceInTrx) < 10) {
        console.log("⚠️  Low balance - you may need more TRX for contract deployment");
      } else {
        console.log("✅ Sufficient balance for deployment");
      }

      console.log(`🔍 Explorer: ${network.explorer}/address/${address}`);
    } catch (error) {
      console.log(`❌ Error checking ${network.name}: ${error.message}`);

      // Show manual instructions if API fails
      const truncatedKey = `${privateKey.substring(0, 6)}...${privateKey.substring(privateKey.length - 4)}`;
      console.log(`🔐 Private Key: ${truncatedKey}`);
      console.log(`🔍 Check manually: ${network.explorer}`);
      if (network.faucet) {
        console.log(`🚰 Get testnet TRX: ${network.faucet}`);
      }
    }

    console.log("");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💡 Tips:");
  console.log("• You need at least 10-100 TRX for contract deployment");
  console.log("• Testnet TRX is free from faucets");
  console.log("• Check balances before deploying");
  console.log("• Use yarn tron:deploy:testnet to deploy to Shasta");
}

checkTronBalance().catch(console.error);
