import React, { useMemo } from "react";
import { Address as EthAddress } from "./Address/Address";
import { getAddress } from "viem";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";
import { AddressType } from "~~/types/abitype/abi";

type UnifiedAddressProps = {
  address?: AddressType | string;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  onlyEnsOrAddress?: boolean;
};

/**
 * Unified Address component that handles both Ethereum and Tron addresses
 */
export const UnifiedAddress = ({
  address,
  disableAddressLink,
  format,
  size = "base",
  onlyEnsOrAddress = false,
}: UnifiedAddressProps) => {
  const { activeBlockchain } = useUnifiedWeb3();

  // Determine if this is a Tron address
  const isTronAddress = useMemo(() => {
    if (!address) return false;
    const addressStr = address.toString();
    return addressStr.startsWith("T") && addressStr.length === 34;
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

  // For Tron addresses, render a simple display without validation
  const displayAddress = useMemo(() => {
    if (!address) return "";
    const addressStr = address.toString();

    if (format === "short") {
      return `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`;
    }
    return addressStr;
  }, [address, format]);

  const textSizeMap = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
  };

  const blockieSizeMap = {
    xs: 6,
    sm: 7,
    base: 8,
    lg: 9,
    xl: 10,
    "2xl": 12,
    "3xl": 15,
  };

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
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
      <span className={`ml-1.5 ${textSizeMap[size]} font-normal`}>{displayAddress}</span>
    </div>
  );
};
