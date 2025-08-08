const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

module.exports = {
  contracts_directory: "./contracts",
  contracts_build_directory: "./build/contracts",
  migrations_directory: "./tron-migrations",
  test_directory: "./tron-test",

  networks: {
    development: {
      // For local development node
      privateKey:
        process.env.TRON_PRIVATE_KEY_DEV || "da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0",
      userFeePercentage: 30,
      feeLimit: 1000 * 1e6,
      fullHost: "http://127.0.0.1:9090",
      network_id: "*",
    },
    shasta: {
      // Tron Testnet
      privateKey: process.env.TRON_PRIVATE_KEY_SHASTA,
      userFeePercentage: 50,
      feeLimit: 1000 * 1e6,
      fullHost: "https://api.shasta.trongrid.io",
      network_id: "2",
    },
    nile: {
      // Tron Nile Testnet
      privateKey: process.env.TRON_PRIVATE_KEY_NILE,
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: "https://api.nileex.io",
      network_id: "3",
    },
    mainnet: {
      // Tron Mainnet
      privateKey: process.env.TRON_PRIVATE_KEY_MAINNET,
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: "https://api.trongrid.io",
      network_id: "1",
    },
  },

  // Working directories - make sure paths are relative to project root
  project_directory: __dirname,
  working_directory: __dirname,

  // Solc compiler configuration
  compilers: {
    solc: {
      version: "0.8.23",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  // Mocha configuration for tests
  mocha: {
    timeout: 20000,
  },
};
