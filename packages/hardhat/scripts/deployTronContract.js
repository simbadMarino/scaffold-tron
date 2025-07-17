#!/usr/bin/env node

// Import TronWeb using the correct property (same as other scripts)
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
  process.exit(1);
}
const fs = require("fs");
const path = require("path");

// Load environment variables from the local .env file
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

// Tron network configurations
const networks = {
  shasta: {
    fullHost: "https://api.shasta.trongrid.io",
    solidityNode: "https://api.shasta.trongrid.io",
    eventServer: "https://api.shasta.trongrid.io",
    network_id: 2494104990,
  },
  nile: {
    fullHost: "https://nile.trongrid.io",
    solidityNode: "https://nile.trongrid.io",
    eventServer: "https://nile.trongrid.io",
    network_id: 3448148188,
  },
  mainnet: {
    fullHost: "https://api.trongrid.io",
    solidityNode: "https://api.trongrid.io",
    eventServer: "https://api.trongrid.io",
    network_id: 728126428,
  },
};

async function deployContract(networkName = "shasta") {
  const network = networks[networkName];
  if (!network) {
    console.error(`Network ${networkName} not found. Available networks: ${Object.keys(networks).join(", ")}`);
    return;
  }

  console.log(`🚀 Deploying to ${networkName}...`);

  // Load private key from environment variable
  // Try network-specific key first, then fall back to generic key
  const privateKey = process.env[`TRON_PRIVATE_KEY_${networkName.toUpperCase()}`] || process.env.TRON_PRIVATE_KEY;

  if (!privateKey) {
    console.error("❌ Please set TRON_PRIVATE_KEY environment variable");
    console.log(`Example: export TRON_PRIVATE_KEY_${networkName.toUpperCase()}=your_private_key_here`);
    console.log("Or: export TRON_PRIVATE_KEY=your_private_key_here");
    console.log("You can get testnet TRX from:");
    console.log("- Shasta: https://www.trongrid.io/shasta");
    console.log("- Nile: https://nile.tronscan.org/");
    return;
  }

  // Initialize TronWeb
  const tronWeb = new TronWeb({
    fullHost: network.fullHost,
    solidityNode: network.solidityNode,
    eventServer: network.eventServer,
    privateKey: privateKey,
  });

  try {
    // Get the contract bytecode and ABI from Hardhat artifacts
    const contractPath = path.join(__dirname, "..", "artifacts", "contracts", "YourContract.sol", "YourContract.json");

    if (!fs.existsSync(contractPath)) {
      console.error("❌ Contract artifacts not found. Please run: yarn hardhat compile");
      return;
    }

    const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
    const { abi, bytecode } = contractJson;

    console.log("📝 Contract ABI and bytecode loaded");

    // Get the deployer address
    const address = tronWeb.address.fromPrivateKey(privateKey);
    console.log(`👤 Deployer address: ${address}`);

    // Check balance
    const balance = await tronWeb.trx.getBalance(address);
    console.log(`💰 Balance: ${tronWeb.fromSun(balance)} TRX`);

    if (balance < 1000000) {
      // Less than 1 TRX
      console.log("⚠️  Low balance! You might need more TRX for deployment");
    }

    // Deploy the contract
    console.log("🔧 Deploying contract...");
    const contractFactory = tronWeb.contract();
    const deployedContract = await contractFactory.new({
      abi: abi,
      bytecode: bytecode,
      feeLimit: 1000000000, // 1000 TRX fee limit
      callValue: 0,
      parameters: [address], // Pass deployer address as constructor parameter
    });

    console.log("✅ Contract deployed successfully!");
    console.log(`📍 Contract address: ${deployedContract.address}`);
    console.log(`🔗 View on explorer: https://${networkName}.tronscan.org/#/address/${deployedContract.address}`);

    // Update the deployments file
    updateDeploymentFile(networkName, deployedContract.address, network.network_id);

    // Automatically generate the TypeScript contracts file
    console.log("🔄 Generating TypeScript contracts file...");
    try {
      const { generateTronContractsFile } = require("./generateTronContractsTs");
      generateTronContractsFile();
      console.log("✅ TypeScript contracts file updated!");
    } catch (genError) {
      console.warn("⚠️  Failed to generate TypeScript contracts file:", genError.message);
      console.log("💡 You can manually run: yarn generate:tron-contracts");
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error);

    if (error.message.includes("CONTRACT_VALIDATE_ERROR")) {
      console.log("💡 This might be due to insufficient balance or network issues");
    }
  }
}

function updateDeploymentFile(networkName, contractAddress, networkId) {
  const deploymentsPath = path.join(__dirname, "..", "..", "nextjs", "tron-deployments.json");
  let deployments = {};

  try {
    if (fs.existsSync(deploymentsPath)) {
      deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
    }
  } catch (error) {
    console.log("Creating new deployments file...");
  }

  if (!deployments[networkId]) {
    deployments[networkId] = {};
  }

  deployments[networkId].YourContract = {
    address: contractAddress,
    network: networkName,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log(`📄 Updated deployments file: ${deploymentsPath}`);
}

// Run the deployment
const networkName = process.argv[2] || "shasta";
deployContract(networkName);
