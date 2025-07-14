#!/usr/bin/env node

/**
 * Script to generate deployedTronContracts.ts from Tron build artifacts
 * Similar to how deployedContracts.ts is generated for Ethereum
 *
 * Usage: node scripts/generateTronContracts.js
 */

const fs = require("fs");
const path = require("path");

// Tron network configurations
const TRON_NETWORKS = {
  2494104990: { name: "Shasta Testnet", rpc: "https://api.shasta.trongrid.io" },
  3448148188: { name: "Nile Testnet", rpc: "https://nile.trongrid.io" },
  728126428: { name: "Tron Mainnet", rpc: "https://api.trongrid.io" },
};

/**
 * Read Tron deployment information from a JSON file
 * This would be created by your Tron deployment scripts
 */
function readTronDeployments() {
  const deploymentsPath = path.join(__dirname, "../../tron-deployments.json");

  if (!fs.existsSync(deploymentsPath)) {
    console.log("📝 No tron-deployments.json found. Creating template...");
    const template = {
      2494104990: {}, // Shasta
      3448148188: {}, // Nile
      728126428: {}, // Mainnet
    };
    fs.writeFileSync(deploymentsPath, JSON.stringify(template, null, 2));
    return template;
  }

  return JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
}

/**
 * Read contract ABI from Hardhat artifacts
 * Since Tron contracts are Solidity, we can reuse Ethereum ABIs
 */
function getContractAbi(contractName) {
  const artifactPath = path.join(
    __dirname,
    "../../hardhat/artifacts/contracts",
    `${contractName}.sol/${contractName}.json`,
  );

  if (!fs.existsSync(artifactPath)) {
    console.error(`❌ Contract artifact not found: ${artifactPath}`);
    return null;
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  return artifact.abi;
}

/**
 * Generate the deployedTronContracts.ts file
 */
function generateTronContractsFile() {
  const deployments = readTronDeployments();
  const contractNames = new Set();

  // Collect all unique contract names
  Object.values(deployments).forEach(network => {
    Object.keys(network).forEach(name => contractNames.add(name));
  });

  // Generate ABI exports for each contract
  let abiExports = "";
  const contractAbis = {};

  contractNames.forEach(contractName => {
    const abi = getContractAbi(contractName);
    if (abi) {
      contractAbis[contractName] = abi;
      abiExports += `
// ${contractName} ABI
const ${contractName.toLowerCase()}Abi = ${JSON.stringify(abi, null, 2)} as const;
`;
    }
  });

  // Generate network deployments
  let networkDeployments = "";
  Object.entries(TRON_NETWORKS).forEach(([chainId, network]) => {
    const networkContracts = deployments[chainId] || {};

    networkDeployments += `  // ${network.name} (chainId: ${chainId})\n`;
    networkDeployments += `  ${chainId}: {\n`;

    Object.entries(networkContracts).forEach(([contractName, address]) => {
      const abiVarName = `${contractName.toLowerCase()}Abi`;
      networkDeployments += `    ${contractName}: {\n`;
      networkDeployments += `      address: "${address}",\n`;
      networkDeployments += `      abi: ${abiVarName},\n`;
      networkDeployments += `      inheritedFunctions: {},\n`;
      networkDeployments += `    },\n`;
    });

    networkDeployments += `  },\n`;
  });

  const fileContent = `/**
 * This file contains the deployed Tron contracts configuration.
 * Generated automatically - do not edit manually!
 * 
 * To update deployments:
 * 1. Update tron-deployments.json with your contract addresses
 * 2. Run: yarn generate:tron-contracts
 */

export type TronContract = {
  address: string;
  abi: readonly any[];
  inheritedFunctions?: Record<string, string>;
};

export type TronContractsDeclaration = Record<number, Record<string, TronContract>>;
${abiExports}
const deployedTronContracts = {
${networkDeployments}} as const satisfies TronContractsDeclaration;

export default deployedTronContracts;
`;

  // Write the file
  const outputPath = path.join(__dirname, "../contracts/deployedTronContracts.ts");
  fs.writeFileSync(outputPath, fileContent);

  console.log("✅ Generated deployedTronContracts.ts");
  console.log(`📍 Found ${contractNames.size} contract type(s)`);

  Object.entries(TRON_NETWORKS).forEach(([chainId, network]) => {
    const networkContracts = deployments[chainId] || {};
    const count = Object.keys(networkContracts).length;
    console.log(`   ${network.name}: ${count} contract(s)`);
  });
}

/**
 * Add a new deployment to tron-deployments.json
 */
function addDeployment(contractName, address, networkId) {
  const deployments = readTronDeployments();

  if (!deployments[networkId]) {
    deployments[networkId] = {};
  }

  deployments[networkId][contractName] = address;

  const deploymentsPath = path.join(__dirname, "../../tron-deployments.json");
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));

  console.log(`✅ Added ${contractName} deployment: ${address} on network ${networkId}`);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args[0] === "add" && args.length === 4) {
    const [, contractName, address, networkId] = args;
    addDeployment(contractName, address, parseInt(networkId));
    generateTronContractsFile();
  } else if (args[0] === "generate" || args.length === 0) {
    generateTronContractsFile();
  } else {
    console.log(`
Usage:
  node scripts/generateTronContracts.js                          # Generate from tron-deployments.json
  node scripts/generateTronContracts.js add <name> <address> <networkId>  # Add deployment and regenerate

Examples:
  node scripts/generateTronContracts.js add YourContract THH...49 2494104990
  node scripts/generateTronContracts.js generate
`);
  }
}

module.exports = { generateTronContractsFile, addDeployment };
