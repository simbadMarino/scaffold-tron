"use client";

import { ReactNode, createContext, useContext, useState } from "react";
import { useTron } from "./tronConfig";
import { useAccount, useChainId } from "wagmi";

export type BlockchainType = "ethereum" | "tron";

export interface UnifiedWeb3ContextType {
  activeBlockchain: BlockchainType;
  setActiveBlockchain: (blockchain: BlockchainType) => void;

  // Ethereum data
  ethereumAccount: string | undefined;
  ethereumChainId: number | undefined;
  ethereumIsConnected: boolean;

  // Tron data
  tronAccount: string | undefined;
  tronChainId: number | undefined;
  tronIsConnected: boolean;

  // Unified interface
  activeAccount: string | undefined;
  activeChainId: number | undefined;
  isConnected: boolean;
  activeBalance: number | undefined;

  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

const UnifiedWeb3Context = createContext<UnifiedWeb3ContextType | undefined>(undefined);

export const useUnifiedWeb3 = () => {
  const context = useContext(UnifiedWeb3Context);
  if (context === undefined) {
    throw new Error("useUnifiedWeb3 must be used within a UnifiedWeb3Provider");
  }
  return context;
};

export const UnifiedWeb3Provider = ({ children }: { children: ReactNode }) => {
  const [activeBlockchain, setActiveBlockchain] = useState<BlockchainType>("ethereum");

  // Ethereum hooks
  const { address: ethereumAddress, isConnected: ethereumConnected } = useAccount();
  const chainId = useChainId();

  // Tron hooks
  const {
    account: tronAccount,
    network: tronNetwork,
    isConnected: tronConnected,
    connect: connectTron,
    disconnect: disconnectTron,
    switchNetwork: switchTronNetwork,
  } = useTron();

  // Unified getters
  const activeAccount = activeBlockchain === "ethereum" ? ethereumAddress : tronAccount?.address;
  const activeChainId = activeBlockchain === "ethereum" ? chainId : tronNetwork?.id;
  const isConnected = activeBlockchain === "ethereum" ? ethereumConnected : tronConnected;
  const activeBalance = activeBlockchain === "ethereum" ? undefined : tronAccount?.balance; // TODO: Add Ethereum balance

  const connectWallet = async () => {
    if (activeBlockchain === "tron") {
      await connectTron();
    } else {
      // Ethereum connection is handled by RainbowKit
      console.log("Use RainbowKit connect button for Ethereum");
    }
  };

  const disconnectWallet = () => {
    if (activeBlockchain === "tron") {
      disconnectTron();
    } else {
      // Ethereum disconnection is handled by RainbowKit
      console.log("Use RainbowKit disconnect for Ethereum");
    }
  };

  const switchNetwork = async (chainId: number) => {
    if (activeBlockchain === "tron") {
      await switchTronNetwork(chainId);
    } else {
      // Ethereum network switching is handled by wagmi/RainbowKit
      console.log("Use wagmi switchNetwork for Ethereum");
    }
  };

  const value: UnifiedWeb3ContextType = {
    activeBlockchain,
    setActiveBlockchain,

    // Ethereum data
    ethereumAccount: ethereumAddress,
    ethereumChainId: chainId,
    ethereumIsConnected: ethereumConnected,

    // Tron data
    tronAccount: tronAccount?.address,
    tronChainId: tronNetwork?.id,
    tronIsConnected: tronConnected,

    // Unified interface
    activeAccount,
    activeChainId,
    isConnected,
    activeBalance,

    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };

  return <UnifiedWeb3Context.Provider value={value}>{children}</UnifiedWeb3Context.Provider>;
};
