"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { tronMainnet, tronNile, tronShasta } from "~~/utils/scaffold-eth/networks";

// Types
export interface TronNetwork {
  id: number;
  name: string;
  fullHost: string;
  solidityNode?: string;
  eventServer?: string;
  faucetUrl?: string;
  explorerUrl: string;
  testnet: boolean;
}

export interface TronAccount {
  address: string;
  balance: number;
}

export interface TronContextType {
  tronWeb: any;
  account: TronAccount | null;
  network: TronNetwork;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (networkId: number) => Promise<void>;
  availableNetworks: TronNetwork[];
}

// Tron Networks Configuration
export const TRON_NETWORKS: Record<number, TronNetwork> = {
  [tronShasta.id]: {
    id: tronShasta.id,
    name: tronShasta.name,
    fullHost: "https://api.shasta.trongrid.io",
    solidityNode: "https://api.shasta.trongrid.io",
    eventServer: "https://api.shasta.trongrid.io",
    faucetUrl: "https://shasta.tronex.io/join/getJoinPage",
    explorerUrl: "https://shasta.tronscan.org",
    testnet: true,
  },
  [tronNile.id]: {
    id: tronNile.id,
    name: tronNile.name,
    fullHost: "https://nile.trongrid.io",
    solidityNode: "https://nile.trongrid.io",
    eventServer: "https://nile.trongrid.io",
    faucetUrl: "https://nileex.io/join/getJoinPage",
    explorerUrl: "https://nile.tronscan.org",
    testnet: true,
  },
  [tronMainnet.id]: {
    id: tronMainnet.id,
    name: tronMainnet.name,
    fullHost: "https://api.trongrid.io",
    solidityNode: "https://api.trongrid.io",
    eventServer: "https://api.trongrid.io",
    explorerUrl: "https://tronscan.org",
    testnet: false,
  },
};

// Create Context
const TronContext = createContext<TronContextType | undefined>(undefined);

// Custom hook to use Tron context
export const useTron = () => {
  const context = useContext(TronContext);
  if (context === undefined) {
    throw new Error("useTron must be used within a TronProvider");
  }
  return context;
};

// Tron Provider Component
export const TronProvider = ({ children }: { children: ReactNode }) => {
  const [tronWeb, setTronWeb] = useState<any>(null);
  const [account, setAccount] = useState<TronAccount | null>(null);
  const [network, setNetwork] = useState<TronNetwork>(TRON_NETWORKS[tronShasta.id]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize TronWeb
  useEffect(() => {
    const initTronWeb = async () => {
      if (typeof window !== "undefined") {
        try {
          // First try to use window.TronWeb if available (from TronLink)
          if ((window as any).TronWeb) {
            console.log("Using TronWeb from window (TronLink)");
            const TronWebConstructor = (window as any).TronWeb;
            const tronWebInstance = new TronWebConstructor({
              fullHost: network.fullHost,
              solidityNode: network.solidityNode,
              eventServer: network.eventServer,
            });
            setTronWeb(tronWebInstance);
            return;
          }

          // Fallback to dynamic import
          console.log("Importing TronWeb dynamically");

          // Try different import methods
          let TronWebConstructor;

          try {
            // Method 1: ES6 dynamic import
            const TronWebModule = await import("tronweb");
            console.log("TronWeb module:", TronWebModule);
            console.log("TronWeb default:", TronWebModule.default);
            console.log("Available properties:", Object.keys(TronWebModule.default || {}));

            const tronWebDefault = TronWebModule.default;

            if (typeof tronWebDefault === "function") {
              TronWebConstructor = tronWebDefault;
            } else if (tronWebDefault && typeof (tronWebDefault as any).TronWeb === "function") {
              // Look for TronWeb property
              TronWebConstructor = (tronWebDefault as any).TronWeb;
            } else if (tronWebDefault) {
              // TronWeb v6.0.3 structure - look for the main constructor
              // Based on the logs, it seems like the whole default export IS the TronWeb API
              // Try to use it directly as constructor
              try {
                console.log("Attempting to use default export as constructor");
                const testInstance = new (tronWebDefault as any)({
                  fullHost: network.fullHost,
                  solidityNode: network.solidityNode,
                  eventServer: network.eventServer,
                });
                console.log("Success! Using default export as constructor");
                TronWebConstructor = tronWebDefault;
              } catch (constructorError) {
                console.log("Default export not a constructor, looking deeper...");

                // Look through properties for a constructor
                for (const [key, value] of Object.entries(tronWebDefault)) {
                  if (typeof value === "function") {
                    console.log(`Checking ${key}:`, value.name);
                    if (key === "TronWeb" || value.name === "TronWeb") {
                      TronWebConstructor = value;
                      console.log(`Found constructor: ${key}`);
                      break;
                    }
                  }
                }
              }
            }
          } catch (importError) {
            console.log("ES6 import failed:", importError);
          }

          // Method 2: Try require if import failed
          if (!TronWebConstructor) {
            try {
              const TronWebRequire = require("tronweb");
              console.log("TronWeb require:", TronWebRequire);
              console.log("Require properties:", Object.keys(TronWebRequire));

              if (typeof TronWebRequire === "function") {
                TronWebConstructor = TronWebRequire;
              } else if (typeof TronWebRequire.default === "function") {
                TronWebConstructor = TronWebRequire.default;
              } else if (TronWebRequire && typeof TronWebRequire.TronWeb === "function") {
                TronWebConstructor = TronWebRequire.TronWeb;
              } else if (TronWebRequire) {
                // Try the same approach as with import
                try {
                  console.log("Attempting to use require result as constructor");
                  const testInstance = new (TronWebRequire as any)({
                    fullHost: network.fullHost,
                    solidityNode: network.solidityNode,
                    eventServer: network.eventServer,
                  });
                  console.log("Success! Using require result as constructor");
                  TronWebConstructor = TronWebRequire;
                } catch (constructorError) {
                  console.log("Require result not a constructor, looking deeper...");
                }
              }
            } catch (requireError) {
              console.log("Require failed:", requireError);
            }
          }

          if (!TronWebConstructor) {
            console.error("Could not find TronWeb constructor after all attempts");
            return;
          }

          const tronWebInstance = new TronWebConstructor({
            fullHost: network.fullHost,
            solidityNode: network.solidityNode,
            eventServer: network.eventServer,
          });

          setTronWeb(tronWebInstance);
        } catch (error) {
          console.error("Failed to initialize TronWeb:", error);
        }
      }
    };

    initTronWeb();
  }, [network]);

  // Check for TronLink
  useEffect(() => {
    const checkTronLink = async () => {
      if (typeof window !== "undefined" && window.tronLink) {
        try {
          const result = await window.tronLink.request({ method: "tron_requestAccounts" });
          if (result.code === 200) {
            setIsConnected(true);
            await updateAccount();
          }
        } catch (error) {
          console.log("TronLink not connected");
        }
      }
    };

    checkTronLink();
  }, [tronWeb]); // Add tronWeb as dependency

  const updateAccount = async () => {
    if (window.tronWeb && window.tronWeb.ready) {
      try {
        const address = window.tronWeb.defaultAddress.base58;
        const balanceResult = await window.tronWeb.trx.getBalance(address);
        const balance = window.tronWeb.fromSun(balanceResult);

        setAccount({
          address,
          balance: parseFloat(balance),
        });
      } catch (error) {
        console.error("Failed to get account info:", error);
      }
    }
  };

  // Set address on TronWeb instance when both are available
  useEffect(() => {
    if (tronWeb && account?.address) {
      try {
        tronWeb.setAddress(account.address);
        console.log("Set TronWeb address to:", account.address);
      } catch (error) {
        console.error("Failed to set TronWeb address:", error);
      }
    }
  }, [tronWeb, account?.address]);

  const connect = async () => {
    if (!window.tronLink) {
      window.open("https://www.tronlink.org/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      const result = await window.tronLink.request({ method: "tron_requestAccounts" });
      if (result.code === 200) {
        setIsConnected(true);
        await updateAccount();
      }
    } catch (error) {
      console.error("Failed to connect to TronLink:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAccount(null);
  };

  const switchNetwork = async (networkId: number) => {
    const targetNetwork = TRON_NETWORKS[networkId];
    if (targetNetwork) {
      setNetwork(targetNetwork);
      // Note: TronLink doesn't have automatic network switching like MetaMask
      // Users need to manually switch in TronLink wallet
    }
  };

  const value: TronContextType = {
    tronWeb,
    account,
    network,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    switchNetwork,
    availableNetworks: Object.values(TRON_NETWORKS),
  };

  return <TronContext.Provider value={value}>{children}</TronContext.Provider>;
};

// Declare global window types for TronLink
declare global {
  interface Window {
    tronLink: any;
    tronWeb: any;
  }
}
