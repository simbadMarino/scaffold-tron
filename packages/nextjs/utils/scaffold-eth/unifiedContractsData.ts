import deployedTronContracts from "~~/contracts/deployedTronContracts";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
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

  if (activeBlockchain === "tron") {
    const tronContractsData = formatTronContracts(deployedTronContracts, tronNetwork?.id || 0);
    return tronContractsData || DEFAULT_ALL_CONTRACTS;
  } else {
    const ethereumContractsData = contracts?.[targetNetwork.id];
    return ethereumContractsData || DEFAULT_ALL_CONTRACTS;
  }
}

export function useActiveNetworkInfo() {
  const { activeBlockchain } = useUnifiedWeb3();
  const { targetNetwork } = useTargetNetwork();
  const { network: tronNetwork } = useTron();

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
