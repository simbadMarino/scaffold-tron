import { useEffect, useState } from "react";
import deployedTronContracts from "~~/contracts/deployedTronContracts";
import { useTron } from "~~/services/web3/tronConfig";

export const useTronNetworkCheck = () => {
  const { tronWeb, network: expectedNetwork, isConnected } = useTron();
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [walletNetwork, setWalletNetwork] = useState<any>(null);

  useEffect(() => {
    const checkNetwork = async () => {
      if (!tronWeb || !isConnected || !window.tronLink) {
        setIsWrongNetwork(false);
        return;
      }

      try {
        // Get the current network from TronLink
        const currentNode = await window.tronLink.request({ method: "tron_requestAccounts" });

        // Get network info from TronWeb
        const nodeInfo = await tronWeb.trx.getNodeInfo();
        const walletNetwork = {
          solidityNode: tronWeb.solidityNode?.host || "",
          fullHost: tronWeb.fullHost || "",
        };

        setWalletNetwork(walletNetwork);

        // Check if wallet network matches our expected network
        const networkMismatch =
          !walletNetwork.fullHost.includes(expectedNetwork.fullHost.replace("https://", "").replace("http://", "")) &&
          !walletNetwork.solidityNode.includes(expectedNetwork.fullHost.replace("https://", "").replace("http://", ""));

        // Also check if we have contracts deployed on the current network
        const hasContracts =
          (deployedTronContracts as any)[expectedNetwork.id] &&
          Object.keys((deployedTronContracts as any)[expectedNetwork.id]).length > 0;

        setIsWrongNetwork(networkMismatch && hasContracts);
      } catch (error) {
        console.error("Error checking Tron network:", error);
        setIsWrongNetwork(false);
      }
    };

    checkNetwork();
  }, [tronWeb, expectedNetwork, isConnected]);

  return {
    isWrongNetwork,
    expectedNetwork,
    walletNetwork,
  };
};
