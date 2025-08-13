#!/usr/bin/env node

/**
 * Script to generate deployedTronContracts.ts from Tron deployments
 * Similar to how deployedContracts.ts is generated for Ethereum
 *
 * Usage: node scripts/generateTronContractsTs.js
 */

const fs = require("fs");
const path = require("path");

// Base58 alphabet for TRON addresses
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex) {
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    result[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return result;
}

/**
 * Simple base58 encode function
 */
function base58Encode(bytes) {
  if (bytes.length === 0) return "";

  let digits = [0];

  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }

    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }

  // Handle leading zeros
  let leadingZeros = 0;
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    leadingZeros++;
  }

  let result = BASE58_ALPHABET[0].repeat(leadingZeros);
  for (let i = digits.length - 1; i >= 0; i--) {
    result += BASE58_ALPHABET[digits[i]];
  }

  return result;
}

/**
 * Simple base58 decode function
 */
function base58Decode(s) {
  let decoded = 0;
  let multi = 1;

  for (let i = s.length - 1; i >= 0; i--) {
    const digit = BASE58_ALPHABET.indexOf(s[i]);
    if (digit === -1) {
      throw new Error(`Invalid base58 character: ${s[i]}`);
    }
    decoded += multi * digit;
    multi *= 58;
  }

  // Convert to bytes
  const bytes = [];
  while (decoded > 0) {
    bytes.unshift(decoded % 256);
    decoded = Math.floor(decoded / 256);
  }

  // Handle leading zeros
  let leadingZeros = 0;
  for (let i = 0; i < s.length && s[i] === BASE58_ALPHABET[0]; i++) {
    leadingZeros++;
  }

  return new Uint8Array([...new Array(leadingZeros).fill(0), ...bytes]);
}

/**
 * Simple SHA256 hash function (using Node.js crypto)
 */
function sha256(data) {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(data).digest();
}

/**
 * Convert TRON hex address to base58 with checksum
 */
function tronHexToBase58(hexAddress) {
  try {
    // Remove 0x prefix if present
    if (hexAddress.startsWith("0x")) {
      hexAddress = hexAddress.slice(2);
    }

    // Convert hex to bytes
    const addressBytes = hexToBytes(hexAddress);

    // Calculate checksum (double SHA256)
    const hash1 = sha256(addressBytes);
    const hash2 = sha256(hash1);
    const checksum = hash2.slice(0, 4);

    // Combine address and checksum
    const addressWithChecksum = new Uint8Array(addressBytes.length + checksum.length);
    addressWithChecksum.set(addressBytes);
    addressWithChecksum.set(checksum, addressBytes.length);

    // Encode to base58
    return base58Encode(addressWithChecksum);
  } catch (error) {
    console.error("Error converting hex to base58:", error);
    return null;
  }
}

/**
 * Convert TRON base58 address to hex
 */
function tronBase58ToHex(base58Address) {
  try {
    // Decode from base58
    const decoded = base58Decode(base58Address);

    // Remove checksum (last 4 bytes)
    const addressBytes = decoded.slice(0, -4);

    // Convert to hex
    return Array.from(addressBytes, byte => byte.toString(16).padStart(2, "0")).join("");
  } catch (error) {
    console.error("Error converting base58 to hex:", error);
    return null;
  }
}

// Tron network configurations
const TRON_NETWORKS = {
  2494104990: { name: "Shasta Testnet", rpc: "https://api.shasta.trongrid.io" },
  3448148188: { name: "Nile Testnet", rpc: "https://nile.trongrid.io" },
  728126428: { name: "Tron Mainnet", rpc: "https://api.trongrid.io" },
};

/**
 * Convert hex address to base58 format for TRON
 */
function convertHexToBase58(address) {
  try {
    // Check if it's already in base58 format (starts with T)
    if (address.startsWith("T")) {
      return address;
    }

    // Check if it's a hex address (starts with 41 and is 42 chars long)
    if (address.startsWith("41") && address.length === 42) {
      const base58Address = tronHexToBase58(address);
      if (base58Address) {
        console.log(`🔄 Converted ${address} → ${base58Address}`);
        return base58Address;
      }
    }

    // If it's a 40-char hex without 41 prefix, add the prefix
    if (address.length === 40 && /^[0-9a-fA-F]+$/.test(address)) {
      const hexWithPrefix = "41" + address;
      const base58Address = tronHexToBase58(hexWithPrefix);
      if (base58Address) {
        console.log(`🔄 Converted ${hexWithPrefix} → ${base58Address}`);
        return base58Address;
      }
    }

    // Return as-is if format is unknown
    console.log(`⚠️  Unknown address format: ${address}`);
    return address;
  } catch (error) {
    console.error(`❌ Error converting address ${address}:`, error.message);
    return address;
  }
}

/**
 * Read Tron deployment information from tron-deployments.json
 */
function readTronDeployments() {
  // Read from the root level tron-deployments.json
  const deploymentsPath = path.join(__dirname, "..", "..", "tron-deployments.json");

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
 */
function getContractAbi(contractName) {
  const artifactPath = path.join(
    __dirname,
    "..",
    "build",
    "contracts",
    `${contractName}.json`,
  );
  console.log(artifactPath);
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

    Object.entries(networkContracts).forEach(([contractName, deployment]) => {
      const abiVarName = `${contractName.toLowerCase()}Abi`;
      // Handle both string addresses and deployment objects
      const address = typeof deployment === "string" ? deployment : deployment.address;

      let hexAddress = address;
      let base58Address = address;

      // Determine which format we have and convert accordingly
      if (address.startsWith("T")) {
        // We have base58, convert to hex for the address field
        base58Address = address;
        const convertedHex = tronBase58ToHex(address);
        if (convertedHex) {
          hexAddress = convertedHex;
        }
      } else {
        // We have hex, convert to base58
        hexAddress = address;
        const convertedBase58 = convertHexToBase58(address);
        if (convertedBase58) {
          base58Address = convertedBase58;
        }
      }

      networkDeployments += `    ${contractName}: {\n`;
      networkDeployments += `      address: "${hexAddress}",\n`;

      // Always include addressBase58 if we have a valid base58 address and it's different from hex
      if (base58Address && base58Address !== hexAddress && base58Address.startsWith("T")) {
        networkDeployments += `      addressBase58: "${base58Address}",\n`;
      }

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
  addressBase58?: string; // Base58 format for block explorer links
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
  const outputPath = path.join(__dirname, "..", "..", "nextjs", "contracts", "deployedTronContracts.ts");
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
function addDeployment(contractName, address, networkId, metadata = {}) {
  const deployments = readTronDeployments();

  if (!deployments[networkId]) {
    deployments[networkId] = {};
  }

  // Store as deployment object with metadata for consistency
  deployments[networkId][contractName] = {
    address: address,
    deployedAt: new Date().toISOString(),
    network: Object.values(TRON_NETWORKS).find(n => n.name.includes(networkId.toString()))?.name || "Unknown",
    ...metadata,
  };

  const deploymentsPath = path.join(__dirname, "..", "..", "tron-deployments.json");
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
  node scripts/generateTronContractsTs.js                          # Generate from tron-deployments.json
  node scripts/generateTronContractsTs.js add <name> <address> <networkId>  # Add deployment and regenerate

Examples:
  node scripts/generateTronContractsTs.js add YourContract THH...49 2494104990
  node scripts/generateTronContractsTs.js generate
`);
  }
}

module.exports = { generateTronContractsFile, addDeployment };
