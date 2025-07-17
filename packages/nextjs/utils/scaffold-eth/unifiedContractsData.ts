import deployedTronContracts from "~~/contracts/deployedTronContracts";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { useTron } from "~~/services/web3/tronConfig";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";
import { GenericContractsDeclaration, contracts } from "~~/utils/scaffold-eth/contract";

const DEFAULT_ALL_CONTRACTS: GenericContractsDeclaration[number] = {};

// Convert Tron contracts to the same format as Ethereum contracts
function formatTronContracts(tronContracts: any, networkId: number) {
  const networkContracts = tronContracts[networkId];
  if (!networkContracts) return {};

  const formattedContracts: any = {};
  Object.keys(networkContracts).forEach(contractName => {
    const contract = networkContracts[contractName];
    formattedContracts[contractName] = {
      address: contract.address as `0x${string}`, // Cast for compatibility
      abi: contract.abi,
      inheritedFunctions: {},
      isTron: true, // Mark as Tron contract
    };
  });

  return formattedContracts;
}

export function useUnifiedContracts() {
  const { activeBlockchain } = useUnifiedWeb3();
  const { targetNetwork } = useTargetNetwork();
  const { network: tronNetwork } = useTron();
  const { ethereumEnabled, tronEnabled } = scaffoldConfig;

  // If neither blockchain is enabled, return empty contracts
  if (!ethereumEnabled && !tronEnabled) {
    return DEFAULT_ALL_CONTRACTS;
  }

  // If only Ethereum is enabled, always return Ethereum contracts
  if (ethereumEnabled && !tronEnabled) {
    const ethereumContractsData = contracts?.[targetNetwork.id];
    return ethereumContractsData || DEFAULT_ALL_CONTRACTS;
  }

  // If only Tron is enabled, always return Tron contracts
  if (!ethereumEnabled && tronEnabled) {
    const tronContractsData = formatTronContracts(deployedTronContracts, tronNetwork?.id || 0);
    return tronContractsData || DEFAULT_ALL_CONTRACTS;
  }

  // If both are enabled, use activeBlockchain to determine which to show
  if (ethereumEnabled && tronEnabled) {
    if (activeBlockchain === "tron") {
      const tronContractsData = formatTronContracts(deployedTronContracts, tronNetwork?.id || 0);
      return tronContractsData || DEFAULT_ALL_CONTRACTS;
    } else {
      const ethereumContractsData = contracts?.[targetNetwork.id];
      return ethereumContractsData || DEFAULT_ALL_CONTRACTS;
    }
  }

  // Fallback
  return DEFAULT_ALL_CONTRACTS;
}

export function useActiveNetworkInfo() {
  const { activeBlockchain } = useUnifiedWeb3();
  const { targetNetwork } = useTargetNetwork();
  const { network: tronNetwork } = useTron();
  const { ethereumEnabled, tronEnabled } = scaffoldConfig;

  // If only Ethereum is enabled, always return Ethereum info
  if (ethereumEnabled && !tronEnabled) {
    return {
      network: targetNetwork,
      blockchain: "Ethereum" as const,
      explorerUrl: targetNetwork.blockExplorers?.default?.url || "https://etherscan.io",
    };
  }

  // If only Tron is enabled, always return Tron info
  if (!ethereumEnabled && tronEnabled) {
    return {
      network: tronNetwork,
      blockchain: "Tron" as const,
      explorerUrl: tronNetwork?.explorerUrl || "https://shasta.tronscan.org",
    };
  }

  // If both are enabled, use activeBlockchain to determine which to show
  if (ethereumEnabled && tronEnabled) {
    if (activeBlockchain === "tron") {
      return {
        network: tronNetwork,
        blockchain: "Tron" as const,
        explorerUrl: tronNetwork?.explorerUrl || "https://shasta.tronscan.org",
      };
    } else {
      return {
        network: targetNetwork,
        blockchain: "Ethereum" as const,
        explorerUrl: targetNetwork.blockExplorers?.default?.url || "https://etherscan.io",
      };
    }
  }

  // Fallback to Ethereum if neither is properly configured
  return {
    network: targetNetwork,
    blockchain: "Ethereum" as const,
    explorerUrl: targetNetwork.blockExplorers?.default?.url || "https://etherscan.io",
  };
}
