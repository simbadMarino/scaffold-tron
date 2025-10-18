require('dotenv').config();
require('@layerzerolabs/hardhat-deploy');
require('@layerzerolabs/hardhat-tron');
require('@nomicfoundation/hardhat-toolbox');


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // IMPORTANT: every version listed under tronSolc.compilers
  // must also be listed in solidity.compilers (plugin requirement).
  // Pick a TRON-supported solc (0.8.23 is a safe choice).
  solidity: {
    compilers: [{ version: '0.8.23' }],
  },
  tronSolc: {
    enable: true,
    filter: [], // compile all contracts
    compilers: [{ version: '0.8.23' }],
    // Optional remapping (example): [['0.8.22', '0.8.23']]
  },
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    // TRON nile JSON-RPC: note the /jsonrpc path and header key
    nile: {
      url: "https://nile.trongrid.io/jsonrpc",
      accounts: [process.env.TRON_PRIVATE_KEY],
      httpHeaders: { "TRON-PRO-API-KEY": process.env.TRON_PRO_API_KEY },
      tron: true,
    },
  },
};
