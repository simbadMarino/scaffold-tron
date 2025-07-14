import React, { useMemo } from "react";
import { Balance as EthBalance } from "./Balance";
import { Address, formatEther } from "viem";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";

type UnifiedBalanceProps = {
  address?: Address | string;
  className?: string;
  usdMode?: boolean;
};

/**
 * Display balance of an address for both Ethereum and Tron
 */
export const UnifiedBalance = ({ address, className = "", usdMode }: UnifiedBalanceProps) => {
  // Determine if this is a Tron address
  const isTronAddress = useMemo(() => {
    if (!address) return false;
    const addressStr = address.toString();
    return addressStr.startsWith("T") && addressStr.length === 34;
  }, [address]);

  // For Ethereum addresses, use the original Balance component
  if (!isTronAddress) {
    return <EthBalance address={address as Address} className={className} usdMode={usdMode} />;
  }

  // For Tron addresses, show a simple TRX balance (placeholder)
  return <span className={`text-sm ${className}`}>TRX: ---</span>;
};
