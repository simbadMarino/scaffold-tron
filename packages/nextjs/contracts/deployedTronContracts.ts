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

// safeTransferTRON ABI
const safetransfertronAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "dataLength",
        "type": "uint256"
      }
    ],
    "name": "DebugTransfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawSimpleUSDT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawUSDT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// callGateway ABI
const callgatewayAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "energyPoolContract",
        "type": "address"
      }
    ],
    "name": "callExternal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Create2Factory ABI
const create2factoryAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "contract SmartWalletTRC20TRX",
        "name": "_newSmartWallet",
        "type": "address"
      }
    ],
    "name": "NewWalletCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_salt",
        "type": "bytes32"
      }
    ],
    "name": "create2SmartWalletDeployment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// DeterministicDeploymentProxy ABI
const deterministicdeploymentproxyAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "addr",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "salt",
        "type": "uint256"
      }
    ],
    "name": "Deployed",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "code",
        "type": "bytes"
      },
      {
        "internalType": "uint256",
        "name": "salt",
        "type": "uint256"
      }
    ],
    "name": "computeAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "predicted",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "code",
        "type": "bytes"
      },
      {
        "internalType": "uint256",
        "name": "salt",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "deployer",
        "type": "address"
      }
    ],
    "name": "computeAddressWithDeployer",
    "outputs": [
      {
        "internalType": "address",
        "name": "predicted",
        "type": "address"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "code",
        "type": "bytes"
      },
      {
        "internalType": "uint256",
        "name": "salt",
        "type": "uint256"
      }
    ],
    "name": "deploy",
    "outputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// DeployClone ABI
const deploycloneAbi = [
  {
    "inputs": [],
    "name": "CloneArgumentsTooLong",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Create2EmptyBytecode",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FailedDeployment",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "InsufficientBalance",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "instance",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "deployer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      }
    ],
    "name": "DeployCREATE2Clone",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "instance",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "deployer",
        "type": "address"
      }
    ],
    "name": "DeployCREATEClone",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      }
    ],
    "name": "cloneCreate",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      }
    ],
    "name": "cloneCreate2",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "args",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      }
    ],
    "name": "cloneCreate2WithArgs",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "args",
        "type": "bytes"
      }
    ],
    "name": "cloneCreateWithArgs",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "cloneAddress",
        "type": "address"
      }
    ],
    "name": "getCloneArgs",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      }
    ],
    "name": "getPredictCreate2Address",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// SmartSweeperAccount ABI
const smartsweeperaccountAbi = [
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "SweepedTRX",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "data_length",
        "type": "uint256"
      }
    ],
    "name": "SweepedToken",
    "type": "event"
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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "_address",
        "type": "address"
      }
    ],
    "name": "sweepTRX",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_trc20Token",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_hotWallet",
        "type": "address"
      }
    ],
    "name": "sweepToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const deployedTronContracts = {
  // Tron Mainnet (chainId: 728126428)
  728126428: {
  },
  // Shasta Testnet (chainId: 2494104990)
  2494104990: {
  },
  // Nile Testnet (chainId: 3448148188)
  3448148188: {
    safeTransferTRON: {
      address: "TJJakXTNZiJ94joTBh3ux1GX8emgBoWz3T",
      addressBase58: "TJJakXTNZiJ94joTBh3ux1GX8emgBoWz3T",
      abi: safetransfertronAbi,
      inheritedFunctions: {},
    },
    callGateway: {
      address: "TWrV3DodTStc2fpMi6G9wegXdDC8Uj5SDo",
      addressBase58: "TWrV3DodTStc2fpMi6G9wegXdDC8Uj5SDo",
      abi: callgatewayAbi,
      inheritedFunctions: {},
    },
    Create2Factory: {
      address: "TSRFahjfAwfybfBL4Dau9V3fL6A1vLjZSg",
      addressBase58: "TSRFahjfAwfybfBL4Dau9V3fL6A1vLjZSg",
      abi: create2factoryAbi,
      inheritedFunctions: {},
    },
    DeterministicDeploymentProxy: {
      address: "THNKUGmrG73dM8VCxjqyAtvTbRE8qdksBb",
      addressBase58: "THNKUGmrG73dM8VCxjqyAtvTbRE8qdksBb",
      abi: deterministicdeploymentproxyAbi,
      inheritedFunctions: {},
    },
    DeployClone: {
      address: "TFtVNQwRhaeGNJNmPk9ZFpVhbMjWRmxMMQ",
      addressBase58: "TFtVNQwRhaeGNJNmPk9ZFpVhbMjWRmxMMQ",
      abi: deploycloneAbi,
      inheritedFunctions: {},
    },
    SmartSweeperAccount: {
      address: "TJ9oNrFkbcNqoJEGVnHQ8rmFLufnZ8q7sV",
      addressBase58: "TJ9oNrFkbcNqoJEGVnHQ8rmFLufnZ8q7sV",
      abi: smartsweeperaccountAbi,
      inheritedFunctions: {},
    },
    SmartSweeperAccountProxy: {
      address: "TTWn7FvfmhSyw6c1DnR931bYApiyVnZqxG",
      addressBase58: "TTWn7FvfmhSyw6c1DnR931bYApiyVnZqxG",
      abi: smartsweeperaccountAbi,
      inheritedFunctions: {},
    },
  },
} as const satisfies TronContractsDeclaration;

export default deployedTronContracts;
