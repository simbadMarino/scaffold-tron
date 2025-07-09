const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

function getAccountFromPrivateKey(privateKey, network) {
  if (!privateKey) {
    return null;
  }

  // For security, only show first 6 characters of the private key
  const secureDisplay = `${privateKey.substring(0, 6)}...${privateKey.substring(privateKey.length - 4)}`;

  return {
    network,
    privateKey: privateKey,
    secureDisplay: secureDisplay,
  };
}

async function listTronAccounts() {
  console.log("🔍 Checking your Tron accounts...\n");

  const networks = [
    {
      name: "Shasta Testnet",
      key: "TRON_PRIVATE_KEY_SHASTA",
      explorer: "https://shasta.tronscan.org",
      faucet: "https://www.trongrid.io/shasta/",
    },
    {
      name: "Nile Testnet",
      key: "TRON_PRIVATE_KEY_NILE",
      explorer: "https://nile.tronscan.org",
      faucet: "https://nileex.io/join/getJoinPage",
    },
    {
      name: "Mainnet",
      key: "TRON_PRIVATE_KEY_MAINNET",
      explorer: "https://tronscan.org",
      faucet: "Purchase TRX from exchange",
    },
    { name: "Development", key: "TRON_PRIVATE_KEY_DEV", explorer: "http://localhost:9090", faucet: "Local testnet" },
  ];

  let foundAccounts = 0;

  console.log("📋 Your Tron Account Configuration:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  for (const network of networks) {
    const privateKey = process.env[network.key];

    if (privateKey) {
      const account = getAccountFromPrivateKey(privateKey, network.name);

      if (account) {
        foundAccounts++;
        console.log(`\n🌐 ${network.name}:`);
        console.log(`   Private Key: ${account.secureDisplay}`);
        console.log(`   Status:      ✅ Configured`);
        console.log(`   Explorer:    ${network.explorer}`);

        if (network.name !== "Development" && network.name !== "Mainnet") {
          console.log(`   Faucet:      ${network.faucet}`);
        } else if (network.name === "Mainnet") {
          console.log(`   Funding:     ${network.faucet}`);
        }
      }
    } else {
      console.log(`\n❌ ${network.name}: No private key configured`);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (foundAccounts === 0) {
    console.log("\n⚠️  No Tron accounts found in your .env file");
    console.log("Run: yarn tron:setup to generate and configure accounts");
  } else {
    console.log(`\n✅ Found ${foundAccounts} configured Tron account(s)`);

    console.log("\n🚀 Quick commands:");
    console.log("• yarn tron:setup          - Generate new accounts");
    console.log("• yarn tron:compile        - Compile contracts");
    console.log("• yarn tron:deploy:testnet - Deploy to Shasta testnet");

    console.log("\n💡 Tips:");
    console.log("• Fund your testnet accounts before deploying");
    console.log("• Always test on testnet before mainnet");
    console.log("• To see full addresses, check your .env file");
    console.log("• Use yarn tron:setup to regenerate accounts if needed");
  }
}

// Run the function
listTronAccounts().catch(console.error);
