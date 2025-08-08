const YourContract = artifacts.require("YourContract");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

module.exports = async function (deployer, network, accounts) {
  // Get the private key from environment variables based on network
  let privateKey;
  if (network === "shasta") {
    privateKey = process.env.TRON_PRIVATE_KEY_SHASTA;
  } else if (network === "nile") {
    privateKey = process.env.TRON_PRIVATE_KEY_NILE;
  } else if (network === "mainnet") {
    privateKey = process.env.TRON_PRIVATE_KEY_MAINNET;
  } else {
    privateKey = process.env.TRON_PRIVATE_KEY_DEV;
  }

  if (!privateKey) {
    throw new Error(`No private key configured for network: ${network}`);
  }

  // Derive the address from the private key
  const tronWebModule = require("tronweb");
  const TronWebConstructor = tronWebModule.TronWeb || tronWebModule.default || tronWebModule;

  // Use simple address derivation
  const tempTronWeb = new TronWebConstructor({
    fullHost: "https://api.shasta.trongrid.io", // Using shasta for address derivation
    privateKey: privateKey,
  });

  const deployerAddress = tempTronWeb.address.fromPrivateKey(privateKey);

  console.log("Deploying YourContract with owner:", deployerAddress);

  // Deploy YourContract with the deployer account as owner
  await deployer.deploy(YourContract, deployerAddress);
};
