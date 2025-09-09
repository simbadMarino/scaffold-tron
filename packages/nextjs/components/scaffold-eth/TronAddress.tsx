/* eslint-disable */
"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { Address as EthAddress } from "./Address/Address";
import { AddressCopyIcon } from "./Address/AddressCopyIcon";
import { getAddress } from "viem";
import { useTron } from "~~/services/web3/tronConfig";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";
import { AddressType } from "~~/types/abitype/abi";
import { getTronScanAddress, isMalformedTronAddress } from "~~/utils/scaffold-eth/tron-address-utils";
import { useUnifiedContracts } from "~~/utils/scaffold-eth/unifiedContractsData";

type TronAddressProps = {
  address?: AddressType | string;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  onlyEnsOrAddress?: boolean;
  contractName?: string; // Optional contract name to get base58 address
};

const textSizeMap = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
} as const;

const blockieSizeMap = {
  xs: 6,
  sm: 7,
  base: 8,
  lg: 9,
  xl: 10,
  "2xl": 12,
  "3xl": 15,
} as const;

const copyIconSizeMap = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  base: "h-[18px] w-[18px]",
  lg: "h-5 w-5",
  xl: "h-[22px] w-[22px]",
  "2xl": "h-6 w-6",
  "3xl": "h-[26px] w-[26px]",
} as const;

/**
 * Unified Address component that handles both Ethereum and Tron addresses
 */
export const TronAddress = ({
  address,
  disableAddressLink,
  format = "short",
  size = "base",
  onlyEnsOrAddress = false,
  contractName,
}: TronAddressProps) => {
  const { activeBlockchain } = useUnifiedWeb3();
  const { network: tronNetwork } = useTron();
  const contractsData = useUnifiedContracts();

  // Get base58 address from contract data if available
  const getBase58Address = useMemo(() => {
    if (contractName && contractsData[contractName]) {
      const contract = contractsData[contractName] as any;
      if (contract.addressBase58) {
        return contract.addressBase58;
      }
    }
    return getTronScanAddress(address?.toString() || "");
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

    // Other TRON address formats (like base58 encoded without T prefix)
    // For this application, we'll treat addresses that don't look like Ethereum addresses as TRON addresses
    if (!addressStr.startsWith("0x") || addressStr.length !== 42) {
      return true;
    }

    // Try to validate as Ethereum address - if it fails, assume it's TRON
    try {
      getAddress(addressStr);
      return false; // Valid Ethereum address
    } catch {
      return true; // Invalid Ethereum address, assume TRON
    }
  }, [address, activeBlockchain]);

  // For Ethereum addresses, use the original Address component
  if (!isTronAddress) {
    return (
      <EthAddress
        address={address as AddressType}
        disableAddressLink={disableAddressLink}
        format={format}
        size={size}
        onlyEnsOrAddress={onlyEnsOrAddress}
      />
    );
  }

  // For Tron addresses, render enhanced display with copy functionality
  const addressStr = address?.toString() || "";

  // Convert to base58 for display
  const base58Address = useMemo(() => {
    if (!addressStr) return "";
    return getBase58Address;
  }, [addressStr, getBase58Address]);

  const displayAddress = useMemo(() => {
    if (!base58Address) return "";

    if (format === "short") {
      return `${base58Address.slice(0, 6)}...${base58Address.slice(-4)}`;
    }
    return base58Address;
  }, [base58Address, format]);

  // Generate block explorer link
  const blockExplorerLink = useMemo(() => {
    if (!base58Address || !tronNetwork?.explorerUrl) return "";

    // Don't create links for malformed addresses from substreams
    if (isMalformedTronAddress(base58Address)) {
      return "";
    }

    // Check if this is a contract address
    const isContractAddress = (() => {
      // Known contract addresses that should use /contract/ path
      const knownContractAddresses = [
        "TU3kjFuhtEo42tsCBtfYUAZxoqQ4yuSLQ5", // JustLend contract
        // Add more known contract addresses here
      ];

      if (knownContractAddresses.includes(base58Address)) {
        return true;
      }

      // Check if the original address is from our deployed contracts
      // TRON contract addresses typically start with "41" in hex format
      const originalAddressStr = address?.toString() || "";
      if (originalAddressStr.startsWith("41") || originalAddressStr.startsWith("0x41")) {
        return true; // This is likely a contract address
      }

      // For TRON, addresses starting with "T" followed by specific patterns are often contracts
      // Contract addresses tend to have different patterns than regular wallet addresses
      // This is a heuristic approach
      if (base58Address.startsWith("T") && base58Address.length === 34) {
        // You can add more specific contract detection logic here
        // For now, we'll use a simple heuristic: if it's not a typical user address pattern
        return false; // Default to address for T-addresses unless specifically known
      }

      return false;
    })();

    const path = isContractAddress ? "contract" : "address";
    return `${tronNetwork.explorerUrl}/#/${path}/${base58Address}`;
  }, [base58Address, tronNetwork?.explorerUrl, address]);

  if (!addressStr) {
    return (
      <div className="flex items-center">
        <div
          className="shrink-0 skeleton rounded-full"
          style={{
            width: blockieSizeMap[size] * 4,
            height: blockieSizeMap[size] * 4,
          }}
        ></div>
        <div className="flex flex-col space-y-1">
          <div className={`ml-1.5 skeleton rounded-lg ${textSizeMap[size]}`}>
            <span className="invisible">T123...456</span>
          </div>
        </div>
      </div>
    );
  }

  // Handle malformed addresses from substreams
  if (isMalformedTronAddress(addressStr)) {
    return (
      <div className="flex items-center space-x-2">
        <div
          className="shrink-0 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold"
          style={{
            width: `${blockieSizeMap[size] * 4}px`,
            height: `${blockieSizeMap[size] * 4}px`,
            fontSize: `${blockieSizeMap[size]}px`,
          }}
        >
          ⚠️
        </div>
        <div className="flex flex-col">
          <span className={`ml-1.5 ${textSizeMap[size]} font-mono text-red-500 dark:text-red-400`}>
            {format === "short" ? `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}` : addressStr}
          </span>
          <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">Malformed address</span>
        </div>
      </div>
    );
  }

  const TronAddressContent = () => <span className={`ml-1.5 ${textSizeMap[size]} font-normal`}>{displayAddress}</span>;

  return (
    <div className="flex items-center shrink-0">
      <div className="shrink-0">
        <div
          className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-yellow-500 text-white font-bold`}
          style={{
            width: `${blockieSizeMap[size] * 4}px`,
            height: `${blockieSizeMap[size] * 4}px`,
            fontSize: `${blockieSizeMap[size]}px`,
          }}
        >
          T
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center">
          {disableAddressLink || !blockExplorerLink ? (
            <TronAddressContent />
          ) : (
            <Link href={blockExplorerLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
              <TronAddressContent />
            </Link>
          )}
          <AddressCopyIcon className={`ml-1 ${copyIconSizeMap[size]} cursor-pointer`} address={addressStr} />
        </div>
      </div>
    </div>
  );
};
