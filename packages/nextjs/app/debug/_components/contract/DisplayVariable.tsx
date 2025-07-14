"use client";

import { useEffect, useState } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { displayTxResult } from "./utilsDisplay";
import { Abi, AbiFunction } from "abitype";
import { Address } from "viem";
import { useReadContract } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import deployedTronContracts from "~~/contracts/deployedTronContracts";
import { useAnimationConfig } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useTron } from "~~/services/web3/tronConfig";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

type DisplayVariableProps = {
  contractAddress: Address;
  abiFunction: AbiFunction;
  refreshDisplayVariables: boolean;
  inheritedFrom?: string;
  abi: Abi;
};

export const DisplayVariable = ({
  contractAddress,
  abiFunction,
  refreshDisplayVariables,
  abi,
  inheritedFrom,
}: DisplayVariableProps) => {
  const { activeBlockchain } = useUnifiedWeb3();
  const { targetNetwork } = useTargetNetwork();
  const { tronWeb, network: tronNetwork } = useTron();
  const [tronResult, setTronResult] = useState<any>(undefined);
  const [isTronLoading, setIsTronLoading] = useState(false);
  const [tronError, setTronError] = useState<string | null>(null);

  // For Ethereum contracts
  const {
    data: ethereumResult,
    isFetching: isEthereumFetching,
    refetch: refetchEthereum,
    error: ethereumError,
  } = useReadContract({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: abi,
    chainId: targetNetwork.id,
    query: {
      retry: false,
      enabled: activeBlockchain === "ethereum",
    },
  });

  // Determine the result and loading state based on active blockchain
  const result = activeBlockchain === "ethereum" ? ethereumResult : tronResult;
  const isFetching = activeBlockchain === "ethereum" ? isEthereumFetching : isTronLoading;
  const error = activeBlockchain === "ethereum" ? ethereumError : tronError;

  const { showAnimation } = useAnimationConfig(result);

  // Function to read from Tron contract
  const readTronContract = async () => {
    if (!tronWeb || !tronNetwork) {
      setTronError("TronWeb not connected");
      return;
    }

    try {
      setIsTronLoading(true);
      setTronError(null);

      // Get the actual Tron address from deployedTronContracts
      const tronContracts = (deployedTronContracts as any)[tronNetwork.id];
      let tronAddress = contractAddress;

      if (tronContracts) {
        for (const [contractName, contractData] of Object.entries(tronContracts)) {
          if ((contractData as any).address) {
            tronAddress = (contractData as any).address;
            break;
          }
        }
      }

      if (!tronAddress) {
        throw new Error("Tron contract address not found");
      }

      const contract = await tronWeb.contract().at(tronAddress);
      const data = await contract[abiFunction.name]().call();
      setTronResult(data);
    } catch (err: any) {
      console.error("Error reading Tron contract:", err);
      setTronError(err.message || "Failed to read contract");
    } finally {
      setIsTronLoading(false);
    }
  };

  // Refetch function that handles both blockchains
  const refetch = async () => {
    if (activeBlockchain === "ethereum") {
      await refetchEthereum();
    } else {
      await readTronContract();
    }
  };

  useEffect(() => {
    if (activeBlockchain === "tron") {
      readTronContract();
    } else {
      refetchEthereum();
    }
  }, [refreshDisplayVariables, activeBlockchain]);

  useEffect(() => {
    if (error) {
      const parsedError = activeBlockchain === "ethereum" ? getParsedError(error) : (error as string);
      notification.error(parsedError);
    }
  }, [error, activeBlockchain]);

  return (
    <div className="space-y-1 pb-2">
      <div className="flex items-center">
        <h3 className="font-medium text-lg mb-0 break-all">{abiFunction.name}</h3>
        <button className="btn btn-ghost btn-xs" onClick={refetch}>
          {isFetching ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <ArrowPathIcon className="h-3 w-3 cursor-pointer" aria-hidden="true" />
          )}
        </button>
        <InheritanceTooltip inheritedFrom={inheritedFrom} />
      </div>
      <div className="text-base-content/80 flex flex-col items-start">
        <div>
          <div
            className={`break-all block transition bg-transparent ${
              showAnimation ? "bg-warning rounded-xs animate-pulse-fast" : ""
            }`}
          >
            {displayTxResult(result)}
          </div>
        </div>
      </div>
    </div>
  );
};
