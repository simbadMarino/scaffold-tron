"use client";
import { useScaffoldWriteContract } from "./useScaffoldWriteContract";
import { useTronWriteContract } from "./useTronWriteContract";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";

interface UseUnifiedWriteContractParams {
  contractName: string;
}

interface UnifiedWriteContractArgs {
  functionName: string;
  args?: any[];
  value?: bigint; // For Ethereum (in Wei)
  callValue?: number; // For Tron (in TRX)
}

/**
 * Unified hook that writes to either Ethereum or Tron contracts based on active blockchain
 */
export const useUnifiedWriteContract = ({ contractName }: UseUnifiedWriteContractParams) => {
  const { activeBlockchain } = useUnifiedWeb3();

  // Ethereum write hook (cast to avoid strict typing)
  const ethereumWrite = useScaffoldWriteContract("YourContract" as any);

  // Tron write hook
  const tronWrite = useTronWriteContract({ contractName });

  const writeContractAsync = async ({ functionName, args = [], value, callValue }: UnifiedWriteContractArgs) => {
    if (activeBlockchain === "tron") {
      return await tronWrite.writeContractAsync({
        functionName,
        args,
        callValue,
      });
    } else {
      return await (ethereumWrite as any).writeContractAsync({
        functionName,
        args,
        value,
      });
    }
  };

  const writeContract = async (params: UnifiedWriteContractArgs) => {
    if (activeBlockchain === "tron") {
      return tronWrite.writeContract({
        functionName: params.functionName,
        args: params.args,
        callValue: params.callValue,
      });
    } else {
      return (ethereumWrite as any).writeContract({
        functionName: params.functionName,
        args: params.args,
        value: params.value,
      });
    }
  };

  return {
    writeContractAsync,
    writeContract,
    isMining: activeBlockchain === "tron" ? tronWrite.isMining : ethereumWrite.isMining,
    isLoading: activeBlockchain === "tron" ? tronWrite.isLoading : false, // Ethereum doesn't have isLoading
  };
};
