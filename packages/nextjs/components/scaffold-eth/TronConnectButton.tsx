"use client";

import { useEffect, useState } from "react";
import { RainbowKitCustomConnectButton } from "./RainbowKitCustomConnectButton";
import { TronAddress } from "./TronAddress";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTron } from "~~/services/web3/tronConfig";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";

export const TronConnectButton = () => {
  const { activeBlockchain, setActiveBlockchain, isConnected } = useUnifiedWeb3();
  const { connect: connectTron, account: tronAccount, isConnecting } = useTron();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="skeleton w-20 h-8"></div>
      </div>
    );
  }

  const handleBlockchainSwitch = (blockchain: "ethereum" | "tron") => {
    setActiveBlockchain(blockchain);
  };

  const TronConnectButtonInner = () => {
    if (!isConnected) {
      return (
        <button
          className={`btn btn-primary btn-sm ${isConnecting ? "loading" : ""}`}
          onClick={connectTron}
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting..." : "Connect TronLink"}
        </button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <div className="text-sm font-medium">{tronAccount?.balance?.toFixed(2)} TRX</div>
          <TronAddress address={tronAccount?.address} format="short" size="xs" />
        </div>
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-sm btn-outline">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <a
                href={`https://shasta.tronscan.org/#/address/${tronAccount?.address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Explorer
              </a>
            </li>
            <li>
              <button onClick={() => navigator.clipboard.writeText(tronAccount?.address || "")}>Copy Address</button>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2">
      {/* Blockchain Switcher */}
      <div className="tabs tabs-boxed bg-base-200">
        <button
          className={`tab tab-sm ${activeBlockchain === "ethereum" ? "tab-active" : ""}`}
          onClick={() => handleBlockchainSwitch("ethereum")}
        >
          <span className="text-xs">ETH</span>
        </button>
        <button
          className={`tab tab-sm ${activeBlockchain === "tron" ? "tab-active" : ""}`}
          onClick={() => handleBlockchainSwitch("tron")}
        >
          <span className="text-xs">TRX</span>
        </button>
      </div>

      {/* Connection Display */}
      {activeBlockchain === "ethereum" ? <RainbowKitCustomConnectButton /> : <TronConnectButtonInner />}
    </div>
  );
};
