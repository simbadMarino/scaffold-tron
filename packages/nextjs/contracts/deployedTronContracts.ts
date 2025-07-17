/**
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

// YourContract ABI
const yourcontractAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "greetingSetter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "newGreeting",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "premium",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "GreetingChange",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "greeting",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "premium",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_newGreeting",
        "type": "string"
      }
    ],
    "name": "setGreeting",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userGreetingCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const;

const deployedTronContracts = {
  // Tron Mainnet (chainId: 728126428)
  728126428: {
  },
  // Shasta Testnet (chainId: 2494104990)
  2494104990: {
    YourContract: {
      address: "41505004d2fcec0000000000000000000000000000",
      addressBase58: "THHrvDG92VzpXg2arnYyFC3EZD8DMEdr49",
      abi: yourcontractAbi,
      inheritedFunctions: {},
    },
  },
  // Nile Testnet (chainId: 3448148188)
  3448148188: {
  },
} as const satisfies TronContractsDeclaration;

export default deployedTronContracts;
