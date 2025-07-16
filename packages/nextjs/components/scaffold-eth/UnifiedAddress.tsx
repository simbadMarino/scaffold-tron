import React, { useMemo } from "react";
import Link from "next/link";
import { Address as EthAddress } from "./Address/Address";
import { AddressCopyIcon } from "./Address/AddressCopyIcon";
import { getAddress } from "viem";
import { useTron } from "~~/services/web3/tronConfig";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";
import { AddressType } from "~~/types/abitype/abi";

type UnifiedAddressProps = {
  address?: AddressType | string;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  onlyEnsOrAddress?: boolean;
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
export const UnifiedAddress = ({
  address,
  disableAddressLink,
  format = "short",
  size = "base",
  onlyEnsOrAddress = false,
}: UnifiedAddressProps) => {
  const { activeBlockchain } = useUnifiedWeb3();
  const { network: tronNetwork } = useTron();

  // Determine if this is a Tron address
  const isTronAddress = useMemo(() => {
    if (!address) return false;
    const addressStr = address.toString();

    // Traditional TRON addresses start with "T" and are 34 characters
    if (addressStr.startsWith("T") && addressStr.length === 34) {
      return true;
    }

    // TRON hex addresses (contract addresses) start with "0x41"
    if (addressStr.startsWith("0x41") && addressStr.length === 42) {
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
  }, [address]);

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
  const displayAddress = useMemo(() => {
    if (!addressStr) return "";

    if (format === "short") {
      return `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`;
    }
    return addressStr;
  }, [addressStr, format]);

  // Generate block explorer link
  const blockExplorerLink = useMemo(() => {
    if (!addressStr || !tronNetwork?.explorerUrl) return "";

    // For hex addresses starting with 0x41, convert to base58 format for the explorer
    if (addressStr.startsWith("0x41") && addressStr.length === 42) {
      // For now, use the hex address directly - TronScan supports both formats
      return `${tronNetwork.explorerUrl}/#/address/${addressStr}`;
    }

    // For traditional TRON addresses (starting with T)
    if (addressStr.startsWith("T") && addressStr.length === 34) {
      return `${tronNetwork.explorerUrl}/#/address/${addressStr}`;
    }

    // For other formats, try to construct a link anyway
    return `${tronNetwork.explorerUrl}/#/address/${addressStr}`;
  }, [addressStr, tronNetwork?.explorerUrl]);

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
