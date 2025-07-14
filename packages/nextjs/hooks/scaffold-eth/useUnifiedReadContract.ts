import { useScaffoldReadContract } from "./useScaffoldReadContract";
import { useTronReadContract } from "./useTronReadContract";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";

interface UseUnifiedReadContractParams {
  contractName: string;
  functionName: string;
  args?: any[];
  watch?: boolean;
}

/**
 * Unified hook that reads from either Ethereum or Tron contracts based on active blockchain
 */
export const useUnifiedReadContract = ({
  contractName,
  functionName,
  args = [],
  watch = true,
}: UseUnifiedReadContractParams) => {
  const { activeBlockchain } = useUnifiedWeb3();

  // Ethereum read (only active when activeBlockchain is ethereum)
  const ethereumResult = useScaffoldReadContract({
    contractName,
    functionName,
    args,
    watch: watch && activeBlockchain === "ethereum",
  } as any);

  // Tron read (only active when activeBlockchain is tron)
  const tronResult = useTronReadContract({
    contractName,
    functionName,
    args,
    watch: watch && activeBlockchain === "tron",
  });

  // Return the appropriate result based on active blockchain
  if (activeBlockchain === "tron") {
    return {
      data: tronResult.data,
      isLoading: tronResult.isLoading,
      error: tronResult.error,
      refetch: tronResult.refetch,
    };
  } else {
    return {
      data: ethereumResult.data,
      isLoading: ethereumResult.isLoading,
      error: ethereumResult.error,
      refetch: ethereumResult.refetch,
    };
  }
};
