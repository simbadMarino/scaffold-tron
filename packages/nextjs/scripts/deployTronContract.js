#!/usr/bin/env node

const TronWeb = require("tronweb");
const fs = require("fs");
const path = require("path");

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

  // You'll need to set your private key as environment variable
  const privateKey = process.env.TRON_PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ Please set TRON_PRIVATE_KEY environment variable");
    console.log("Example: export TRON_PRIVATE_KEY=your_private_key_here");
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
    const contractPath = path.join(__dirname, "../../hardhat/artifacts/contracts/YourContract.sol/YourContract.json");

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
  } catch (error) {
    console.error("❌ Deployment failed:", error);

    if (error.message.includes("CONTRACT_VALIDATE_ERROR")) {
      console.log("💡 This might be due to insufficient balance or network issues");
    }
  }
}

function updateDeploymentFile(networkName, contractAddress, networkId) {
  const deploymentsPath = path.join(__dirname, "../tron-deployments.json");
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
  console.log("🔄 Run: yarn generate:tron-contracts to update the frontend");
}

// Run the deployment
const networkName = process.argv[2] || "shasta";
deployContract(networkName);
