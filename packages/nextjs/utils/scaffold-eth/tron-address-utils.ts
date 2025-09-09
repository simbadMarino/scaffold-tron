// Known address mappings (hex -> base58)
const KNOWN_ADDRESS_MAPPINGS: Record<string, string> = {
  "0x41c64e69acde1c7b16c2a3efcdbbdaa96c3644c2b3": "TU3kjFuhtEo42tsCBtfYUAZxoqQ4yuSLQ5",
  // Add more mappings as needed
};

// Reverse mapping (base58 -> hex)
const REVERSE_ADDRESS_MAPPINGS: Record<string, string> = Object.fromEntries(
  Object.entries(KNOWN_ADDRESS_MAPPINGS).map(([hex, base58]) => [base58, hex]),
);

/**
 * Convert TRON hex address to base58 format
 * @param hexAddress - Address in hex format (e.g., "0x41c64e69acde1c7b16c2a3efcdbbdaa96c3644c2b3")
 * @returns Address in base58 format (e.g., "TC64e69acde1c7b16c2a3efcdbbdaa96c3644c2b3")
 */
export function hexToBase58(hexAddress: string): string {
  try {
    // Try TronWeb first if available (more reliable than hardcoded mappings)
    if (typeof window !== "undefined" && (window as any).TronWeb) {
      try {
        const TronWeb = (window as any).TronWeb;
        const result = TronWeb.address.fromHex(hexAddress);
        return result;
      } catch (error) {
        console.error("TronWeb conversion failed:", error);
      }
    }

    // Check known mappings as fallback
    const knownAddress = KNOWN_ADDRESS_MAPPINGS[hexAddress.toLowerCase()];
    if (knownAddress) {
      return knownAddress;
    }

    // Final fallback: return original address
    return hexAddress;
  } catch (error) {
    console.error("Error converting hex to base58:", error);
    return hexAddress;
  }
}

/**
 * Convert TRON base58 address to hex format
 * @param base58Address - Address in base58 format (e.g., "TC64e69acde1c7b16c2a3efcdbbdaa96c3644c2b3")
 * @returns Address in hex format (e.g., "0x41c64e69acde1c7b16c2a3efcdbbdaa96c3644c2b3")
 */
export function base58ToHex(base58Address: string): string {
  try {
    // Check known mappings first
    const knownAddress = REVERSE_ADDRESS_MAPPINGS[base58Address];
    if (knownAddress) {
      return knownAddress;
    }

    // For other addresses, try to use TronWeb if available
    if (typeof window !== "undefined" && (window as any).TronWeb) {
      try {
        const TronWeb = (window as any).TronWeb;
        const tronWeb = new TronWeb({
          fullHost: "https://api.trongrid.io",
        });

        return tronWeb.address.toHex(base58Address);
      } catch (error) {
        console.error("TronWeb conversion failed:", error);
      }
    }

    // Fallback: return original address
    return base58Address;
  } catch (error) {
    console.error("Error converting base58 to hex:", error);
    return base58Address;
  }
}

/**
 * Check if an address is in hex format
 * @param address - Address to check
 * @returns true if address is in hex format
 */
export function isHexAddress(address: string): boolean {
  // TRON hex addresses are 44 characters long (including 0x), Ethereum addresses are 42 characters
  return address.startsWith("0x") && (address.length === 42 || address.length === 44);
}

/**
 * Check if an address is in base58 format
 * @param address - Address to check
 * @returns true if address is in base58 format
 */
export function isBase58Address(address: string): boolean {
  return address.startsWith("T") && address.length === 34;
}

/**
 * Check if an address is a malformed TRON address (from substreams)
 * @param address - Address to check
 * @returns true if address appears to be malformed TRON address
 */
export function isMalformedTronAddress(address: string): boolean {
  // Malformed addresses from substreams are typically 28 characters and start with Q
  return address.length === 28 && address.startsWith("Q");
}

/**
 * Get the proper format for TronScan transaction links (without 0x prefix)
 * @param txHash - Transaction hash with or without 0x prefix
 * @returns Transaction hash without 0x prefix for TronScan
 */
export function getTronScanTxHash(txHash: string): string {
  if (txHash.startsWith("0x")) {
    return txHash.substring(2);
  }
  return txHash;
}

/**
 * Get the proper format for TronScan links (base58)
 * @param address - Address in any format
 * @returns Address in base58 format for TronScan
 */
export function getTronScanAddress(address: string): string {
  if (isHexAddress(address)) {
    return hexToBase58(address);
  }
  if (isBase58Address(address)) {
    return address;
  }
  // Handle malformed addresses from substreams (28 chars starting with Q)
  if (isMalformedTronAddress(address)) {
    // These addresses are malformed and can't be properly linked to TronScan
    // Return as-is but they won't work as TronScan links
    return address;
  }
  // For other formats, try to convert assuming it's hex without 0x prefix
  if (address.length === 40) {
    return hexToBase58("0x" + address);
  }
  return address;
}
