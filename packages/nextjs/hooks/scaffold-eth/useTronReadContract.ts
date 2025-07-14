import { useEffect, useState } from "react";
import deployedTronContracts from "~~/contracts/deployedTronContracts";
import { useTron } from "~~/services/web3/tronConfig";

interface UseTronReadContractParams {
  contractName: string;
  functionName: string;
  args?: any[];
  watch?: boolean;
}

export const useTronReadContract = ({
  contractName,
  functionName,
  args = [],
  watch = true,
}: UseTronReadContractParams) => {
  const { tronWeb, network, isConnected, account } = useTron();
  const [data, setData] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readContract = async () => {
    if (!tronWeb || !isConnected) {
      setError("TronWeb not connected");
      return;
    }

    // Check if TronWeb has an address set
    if (!tronWeb.defaultAddress || !tronWeb.defaultAddress.base58) {
      console.log("TronWeb address not set, waiting for connection...");
      setError("Wallet address not set");
      return;
    }

    const networkContracts = (deployedTronContracts as any)[network.id];
    if (!networkContracts || !networkContracts[contractName]) {
      setError(`Contract ${contractName} not found on network ${network.name}`);
      return;
    }

    const contractInfo = networkContracts[contractName];

    try {
      setIsLoading(true);
      setError(null);

      console.log("Reading contract with address:", tronWeb.defaultAddress.base58);

      // Create contract instance
      const contract = await tronWeb.contract(contractInfo.abi, contractInfo.address);

      // Call the function
      const result = await contract[functionName](...args).call();

      setData(result);
    } catch (err: any) {
      console.error("Error reading Tron contract:", err);
      setError(err.message || "Failed to read contract");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tronWeb && isConnected && account?.address) {
      readContract();
    }
  }, [tronWeb, isConnected, account?.address, network.id, contractName, functionName, JSON.stringify(args)]);

  // Polling for watch mode
  useEffect(() => {
    if (!watch || !tronWeb || !isConnected || !account?.address) return;

    const interval = setInterval(() => {
      readContract();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [watch, tronWeb, isConnected, account?.address, network.id, contractName, functionName, JSON.stringify(args)]);

  return {
    data,
    isLoading,
    error,
    refetch: readContract,
  };
};
