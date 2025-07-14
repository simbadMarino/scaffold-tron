import { useState } from "react";
import deployedTronContracts from "~~/contracts/deployedTronContracts";
import { useTron } from "~~/services/web3/tronConfig";
import { notification } from "~~/utils/scaffold-eth";

interface UseTronWriteContractParams {
  contractName: string;
}

interface TronWriteContractArgs {
  functionName: string;
  args?: any[];
  callValue?: number; // TRX amount to send (in TRX, not SUN)
  feeLimit?: number; // Fee limit in SUN
}

export const useTronWriteContract = ({ contractName }: UseTronWriteContractParams) => {
  const { tronWeb, network, isConnected, account } = useTron();
  const [isMining, setIsMining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const writeContractAsync = async ({
    functionName,
    args = [],
    callValue = 0,
    feeLimit = 150000000, // 150 TRX fee limit by default
  }: TronWriteContractArgs) => {
    if (!tronWeb || !isConnected || !account) {
      notification.error("Please connect your TronLink wallet");
      return;
    }

    // Check if TronWeb has an address set
    if (!tronWeb.defaultAddress || !tronWeb.defaultAddress.base58) {
      notification.error("Wallet address not set");
      return;
    }

    const networkContracts = (deployedTronContracts as any)[network.id];
    if (!networkContracts || !networkContracts[contractName]) {
      notification.error(`Contract ${contractName} not found on network ${network.name}`);
      return;
    }

    const contractInfo = networkContracts[contractName];

    try {
      setIsLoading(true);
      setIsMining(true);

      // Create contract instance
      const contract = await tronWeb.contract(contractInfo.abi, contractInfo.address);

      // Prepare transaction options
      const options: any = {
        feeLimit,
      };

      // Add callValue if sending TRX
      if (callValue > 0) {
        options.callValue = tronWeb.toSun(callValue);
      }

      // Call the contract method
      const transaction = await contract[functionName](...args).send(options);

      notification.success("Transaction sent! Waiting for confirmation...");

      // Wait for transaction confirmation
      let confirmedTransaction;
      let attempts = 0;
      const maxAttempts = 30; // Wait up to 30 seconds

      while (attempts < maxAttempts) {
        try {
          confirmedTransaction = await tronWeb.trx.getTransaction(transaction);
          if (
            confirmedTransaction &&
            confirmedTransaction.ret &&
            confirmedTransaction.ret[0].contractRet === "SUCCESS"
          ) {
            break;
          }
        } catch (error) {
          // Transaction might not be found yet
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (confirmedTransaction && confirmedTransaction.ret && confirmedTransaction.ret[0].contractRet === "SUCCESS") {
        notification.success("Transaction confirmed!");
        return transaction;
      } else {
        notification.error("Transaction failed or timed out");
        return;
      }
    } catch (error: any) {
      console.error("Error writing to Tron contract:", error);
      notification.error(error.message || "Transaction failed");
      throw error;
    } finally {
      setIsLoading(false);
      setIsMining(false);
    }
  };

  const writeContract = async (params: TronWriteContractArgs) => {
    try {
      await writeContractAsync(params);
    } catch (error) {
      // Error is already handled in writeContractAsync
    }
  };

  return {
    writeContractAsync,
    writeContract,
    isMining,
    isLoading,
  };
};
