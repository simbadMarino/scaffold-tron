#!/usr/bin/env node




// Import TronWeb using the correct property (same as other scripts)
let TronWeb;
let contractName;
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
const readline = require("readline");

// Load environment variables from the local .env file
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

// Tron network configurations
const networks = {
  dev: {
    fullHost: "http://127.0.0.1:9090",
    solidityNode: "http://127.0.0.1:9090",
    eventServer: "http://127.0.0.1:9090",
    network_id: 9999999999,
  },
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

async function deployContract(networkName) {
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
    function askQuestion(query) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
      }));
    }

    async function selectContractFile() {
      const contractsDir = path.join(__dirname, "..", "build", "contracts");
      const contractFiles = fs.readdirSync(contractsDir).filter(file => file.endsWith(".json"));

      if (contractFiles.length === 0) {
        console.error("❌ No compiled contract JSON files found.");
        process.exit(1);
      }

      console.log("📦 Available contracts:");
      contractFiles.forEach((file, index) => {
        console.log(`  [${index}] ${file}`);
      });

      const answer = await askQuestion("Select a contract by number: ");
      const index = parseInt(answer, 10);

      if (isNaN(index) || index < 0 || index >= contractFiles.length) {
        console.error("❌ Invalid selection.");
        process.exit(1);
      }

      const selectedFile = contractFiles[index];
      contractName = selectedFile.replace(/\.json$/, '');
      //console.log("Contract Name: " + contractName);
      const contractPath = path.join(contractsDir, selectedFile);
      const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
      const { abi, bytecode } = contractJson;

      return { abi, bytecode, selectedFile };
    }

    const { abi, bytecode, selectedFile } = await selectContractFile();

    console.log(`✅ Loaded contract: ${selectedFile}`);

    // Get the deployer address
    const address = tronWeb.address.fromPrivateKey(privateKey);
    console.log(`👤 Deployer address: ${address}`);

    // Check balance
    const balance = await tronWeb.trx.getBalance(address);
    console.log(`💰 Balance: ${tronWeb.fromSun(balance)} TRX`);

    //Check constructor
    const constructorArray = abi.constructorArray || [];
    console.log(`👷‍♂️ Constructor: ${constructorArray}`);

    if (balance < 1000000000) {
      // Less than 1000 TRX
      console.log("⚠️  Low balance! You might need more TRX for deployment");
    }

    // Deploy the contract
    console.log("🔧 Deploying contract...");
    const contractFactory = tronWeb.contract();
    const deployedContract = await contractFactory.new({
      abi: abi,
      bytecode: bytecode,
      userFeePercentage: 1,
      feeLimit: 1000000000, // 1000 TRX fee limit
      callValue: 0,
      parameters: constructorArray, // Pass deployer address as constructor parameter
    });

    // Converting to base58
    const base58Address = tronWeb.address.fromHex(deployedContract.address);

    console.log("✅ Contract deployed successfully!");
    console.log(`📍 Contract address: ${base58Address}`);



    // Validate the address format
    const isValidAddress = tronWeb.isAddress(base58Address);
    console.log(`📍 Address validation: ${isValidAddress}`);
    console.log(`📍 Address format: ${base58Address.startsWith("T") ? "base58" : "unknown"}`);

    if (!isValidAddress) {
      console.warn("⚠️  Warning: Deployed contract address may be invalid");
    }

    console.log(`🔗 View on explorer: https://${networkName}.tronscan.org/#/contract/${base58Address}`);

    // Update the deployments file
    updateDeploymentFile(networkName, base58Address, network.network_id, tronWeb);

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

function updateDeploymentFile(networkName, contractAddress, networkId, tronWeb) {
  const deploymentsPath = path.join(__dirname, "..", "..", "tron-deployments.json");
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

  // Convert address to base58 format for block explorer
  let base58Address = contractAddress;

  try {
    // Check if address needs conversion (hex format)
    if (contractAddress.startsWith("0x41") || (contractAddress.length === 40 && contractAddress.startsWith("41"))) {
      // Convert hex to base58
      const hexWithPrefix = contractAddress.startsWith("0x") ? contractAddress : `0x${contractAddress}`;
      base58Address = tronWeb.address.fromHex(hexWithPrefix);
      console.log(`📍 Converted to base58: ${contractAddress} → ${base58Address}`);
    } else if (tronWeb.isAddress(contractAddress)) {
      // Already in base58 format
      base58Address = contractAddress;
      console.log(`📍 Address already in base58 format: ${contractAddress}`);
    }
  } catch (error) {
    console.warn("⚠️  Address conversion failed:", error.message);
    base58Address = contractAddress;
  }

  console.log(`📍 Storing contract address: ${contractAddress}`);
  console.log(`📍 Base58 address for explorer: ${base58Address}`);


  deployments[networkId][contractName] = {
    address: contractAddress,
    addressBase58: base58Address,
    network: networkName,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log(`📄 Updated deployments file: ${deploymentsPath}`);
}

// Run the deployment
const networkName = process.argv[2] || "shasta";
deployContract(networkName);
