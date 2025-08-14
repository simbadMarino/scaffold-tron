/* eslint-disable */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Balance as EthBalance } from "./Balance";
import { Address, formatEther } from "viem";
import { useTron } from "~~/services/web3/tronConfig";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";
import { hexToBase58, isBase58Address, isHexAddress } from "~~/utils/scaffold-eth/tron-address-utils";
import { useUnifiedContracts } from "~~/utils/scaffold-eth/unifiedContractsData";

type TronBalanceProps = {
  address?: Address | string;
  className?: string;
  usdMode?: boolean;
  contractName?: string;
};

/**
 * Display balance of an address for both Ethereum and Tron
 */
export const TronBalance = ({ address, className = "", usdMode, contractName }: TronBalanceProps) => {
  const { activeBlockchain } = useUnifiedWeb3();
  const { tronWeb } = useTron();
  const contractsData = useUnifiedContracts();

  // Get base58 address from contract data if available
  const getBase58Address = useMemo(() => {
    if (contractName && contractsData[contractName]) {
      const contract = contractsData[contractName] as any;
      if (contract.addressBase58) {
        return contract.addressBase58;
      }
    }
    // Fallback to conversion if no contract data
    if (!address) return "";
    const addressStr = address.toString();

    // Check if it's already in base58 format (starts with T and 34 chars)
    if (isBase58Address(addressStr)) {
      return addressStr;
    }

    // Check if it's a hex TRON address (with or without 0x prefix)
    if (isHexAddress(addressStr)) {
      return hexToBase58(addressStr);
    }

    // Check if it's a hex TRON address without 0x prefix (like from deployments)
    if (addressStr.length === 40 && addressStr.startsWith("41")) {
      return hexToBase58("0x" + addressStr);
    }

    return addressStr;
  }, [address, contractName, contractsData]);

  // Determine if this is a Tron address
  const isTronAddress = useMemo(() => {
    if (!address) return false;
    const addressStr = address.toString();

    // Traditional TRON addresses start with "T" and are 34 characters
    if (addressStr.startsWith("T") && addressStr.length === 34) {
      return true;
    }

    // TRON hex addresses (contract addresses) start with "0x41" - prioritize this check
    if (addressStr.startsWith("0x41") && addressStr.length === 42) {
      return true;
    }

    // TRON hex addresses without 0x prefix (like from deployments) - 40 chars starting with "41"
    if (addressStr.length === 40 && addressStr.startsWith("41")) {
      return true;
    }

    // Check if we're using TRON as the active blockchain
    if (activeBlockchain === "tron") {
      return true;
    }

    return false;
  }, [address, activeBlockchain]);

  // For Ethereum addresses, use the original Balance component
  if (!isTronAddress) {
    return <EthBalance address={address as Address} className={className} usdMode={usdMode} />;
  }

  // For Tron addresses, fetch and display actual TRX balance
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!tronWeb || !getBase58Address) {
        setError("TronWeb not available");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get balance in SUN (1 TRX = 1,000,000 SUN)
        const balanceInSun = await tronWeb.trx.getBalance(getBase58Address);
        const balanceInTrx = balanceInSun / 1000000;

        setBalance(balanceInTrx.toFixed(6));
      } catch (err) {
        console.error("Error fetching TRX balance:", err);
        setError("Failed to fetch balance");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [tronWeb, getBase58Address]);

  if (isLoading) {
    return <span className={`text-sm ${className}`}>TRX: Loading...</span>;
  }

  if (error) {
    return <span className={`text-sm ${className} text-red-500`}>TRX: Error</span>;
  }

  return <span className={`text-sm ${className}`}>TRX: {balance}</span>;
};
