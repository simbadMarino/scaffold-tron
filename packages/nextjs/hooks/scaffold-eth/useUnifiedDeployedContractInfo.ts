import { useEffect, useState } from "react";
import { useIsMounted } from "usehooks-ts";
import { usePublicClient } from "wagmi";
import { useSelectedNetwork } from "~~/hooks/scaffold-eth";
import { useTron } from "~~/services/web3/tronConfig";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";
import { ContractCodeStatus, ContractName, UseDeployedContractConfig } from "~~/utils/scaffold-eth/contract";
import { useUnifiedContracts } from "~~/utils/scaffold-eth/unifiedContractsData";

type UnifiedContract = {
  address: string;
  abi: any[];
  inheritedFunctions?: any;
  isTron?: boolean;
  external?: boolean;
};

type DeployedContractData<TContractName extends ContractName> = {
  data: UnifiedContract | undefined;
  isLoading: boolean;
};

/**
 * Gets the matching contract info for the provided contract name from both Ethereum and Tron contracts
 */
export function useUnifiedDeployedContractInfo<TContractName extends ContractName>(
  config: UseDeployedContractConfig<TContractName>,
): DeployedContractData<TContractName>;
export function useUnifiedDeployedContractInfo<TContractName extends ContractName>(
  contractName: TContractName,
): DeployedContractData<TContractName>;

export function useUnifiedDeployedContractInfo<TContractName extends ContractName>(
  configOrName: UseDeployedContractConfig<TContractName> | TContractName,
): DeployedContractData<TContractName> {
  const isMounted = useIsMounted();
  const { activeBlockchain } = useUnifiedWeb3();
  const { tronWeb } = useTron();

  const finalConfig: UseDeployedContractConfig<TContractName> =
    typeof configOrName === "string" ? { contractName: configOrName } : (configOrName as any);

  const { contractName, chainId } = finalConfig;
  const selectedNetwork = useSelectedNetwork(chainId);
  const contractsData = useUnifiedContracts();
  const deployedContract = contractsData[contractName as ContractName] as UnifiedContract;

  const [status, setStatus] = useState<ContractCodeStatus>(ContractCodeStatus.LOADING);
  const publicClient = usePublicClient({ chainId: selectedNetwork.id });

  useEffect(() => {
    const checkContractDeployment = async () => {
      try {
        if (!isMounted()) return;

        if (!deployedContract) {
          setStatus(ContractCodeStatus.NOT_FOUND);
          return;
        }

        if (activeBlockchain === "tron") {
          // For Tron contracts, check using TronWeb
          if (!tronWeb) {
            setStatus(ContractCodeStatus.NOT_FOUND);
            return;
          }

          try {
            // Try to get contract from TronWeb
            const contract = await tronWeb.contract().at(deployedContract.address);
            if (contract) {
              setStatus(ContractCodeStatus.DEPLOYED);
            } else {
              setStatus(ContractCodeStatus.NOT_FOUND);
            }
          } catch (error) {
            console.error("Error checking Tron contract deployment:", error);
            setStatus(ContractCodeStatus.NOT_FOUND);
          }
        } else {
          // For Ethereum contracts, use the original method
          if (!publicClient) {
            setStatus(ContractCodeStatus.NOT_FOUND);
            return;
          }

          const code = await publicClient.getBytecode({
            address: deployedContract.address as `0x${string}`,
          });

          // If contract code is `0x` => no contract deployed on that address
          if (code === "0x") {
            setStatus(ContractCodeStatus.NOT_FOUND);
            return;
          }
          setStatus(ContractCodeStatus.DEPLOYED);
        }
      } catch (e) {
        console.error(e);
        setStatus(ContractCodeStatus.NOT_FOUND);
      }
    };

    checkContractDeployment();
  }, [isMounted, contractName, deployedContract, publicClient, activeBlockchain, tronWeb]);

  return {
    data: status === ContractCodeStatus.DEPLOYED ? deployedContract : undefined,
    isLoading: status === ContractCodeStatus.LOADING,
  };
}
