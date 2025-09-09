#!/usr/bin/env node

const { Client } = require("pg");
const { spawn } = require("child_process");
const crypto = require("crypto");

// Base58 encoding alphabet
const BASE58_ALPHABET =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Simple base58 encoding function
 * @param {Buffer} buffer - Buffer to encode
 * @returns {string} Base58 encoded string
 */
function base58Encode(buffer) {
    if (buffer.length === 0) return "";

    let digits = [0];

    for (let i = 0; i < buffer.length; i++) {
        let carry = buffer[i];
        for (let j = 0; j < digits.length; j++) {
            carry += digits[j] << 8;
            digits[j] = carry % 58;
            carry = Math.floor(carry / 58);
        }

        while (carry > 0) {
            digits.push(carry % 58);
            carry = Math.floor(carry / 58);
        }
    }

    // Count leading zeros
    let zeros = 0;
    for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
        zeros++;
    }

    // Convert to string
    let result = "";
    for (let i = 0; i < zeros; i++) {
        result += BASE58_ALPHABET[0];
    }

    for (let i = digits.length - 1; i >= 0; i--) {
        result += BASE58_ALPHABET[digits[i]];
    }

    return result;
}

/**
 * Converts TRON address bytes to Base58Check-encoded string (with checksum).
 * Replicates the Rust tron_address_to_base58 function.
 * @param {Buffer|Uint8Array|string} addressBytes - The address bytes (with 0x41 prefix) or base64 string
 * @returns {string} Base58-encoded TRON address
 */
function tronAddressToBase58(addressBytes) {
    try {
        let bytes;

        // Handle different input types
        if (typeof addressBytes === "string") {
            // Try to decode as base64 first
            try {
                bytes = Buffer.from(addressBytes, "base64");
            } catch (e) {
                // If base64 fails, try hex
                bytes = Buffer.from(addressBytes.replace("0x", ""), "hex");
            }
        } else if (Buffer.isBuffer(addressBytes)) {
            bytes = addressBytes;
        } else if (addressBytes instanceof Uint8Array) {
            bytes = Buffer.from(addressBytes);
        } else {
            throw new Error("Invalid address format");
        }

        // Ensure proper TRON address prefix (0x41)
        if (bytes.length === 20) {
            // Add TRON prefix if missing
            const prefixed = Buffer.concat([Buffer.from([0x41]), bytes]);
            bytes = prefixed;
        }

        // Calculate checksum
        const hash1 = crypto.createHash("sha256").update(bytes).digest();
        const hash2 = crypto.createHash("sha256").update(hash1).digest();
        const checksum = hash2.slice(0, 4);

        // Combine address + checksum
        const payload = Buffer.concat([bytes, checksum]);

        // Encode to base58
        return base58Encode(payload);
    } catch (error) {
        console.error("Error converting address to base58:", error);
        // Return the original input if conversion fails
        return addressBytes;
    }
}

/**
 * Extracts and converts from/owner address from transaction data
 * @param {Object} txData - Transaction data
 * @returns {string|null} Base58-encoded TRON address or null
 */
function extractFromAddress(txData) {
    const rawAddress =
        txData.fromAddress ||
        txData.contracts?.[0]?.parameter?.ownerAddress ||
        null;

    if (!rawAddress) return null;

    return tronAddressToBase58(rawAddress);
}

/**
 * Extracts and converts to address from transaction data
 * @param {Object} txData - Transaction data
 * @returns {string|null} Base58-encoded TRON address or null
 */
function extractToAddress(txData) {
    const rawAddress =
        txData.toAddress || txData.contracts?.[0]?.parameter?.toAddress || null;

    if (!rawAddress) return null;

    return tronAddressToBase58(rawAddress);
}

/**
 * Extracts and converts contract address from transaction data
 * @param {Object} txData - Transaction data
 * @returns {string|null} Base58-encoded TRON address or null
 */
function extractContractAddress(txData) {
    const rawAddress =
        txData.contractAddress || txData.info?.contractAddress || null;

    if (!rawAddress) return null;

    return tronAddressToBase58(rawAddress);
}

// Database configuration
const dbConfig = {
    host: "localhost",
    port: 5432,
    database: "tron_transactions",
    user: "tron_user",
    password: "tron_password",
};

// Create database client
const client = new Client(dbConfig);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("✅ Connected to PostgreSQL database");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
}

async function insertTransaction(txData) {
    try {
        const query = `
      INSERT INTO tron_transactions (
        transaction_hash, 
        block_number, 
        block_timestamp, 
        contract_type, 
        contract_address, 
        from_address, 
        to_address, 
        value, 
        fee, 
        result, 
        raw_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (transaction_hash) DO UPDATE SET
        block_number = EXCLUDED.block_number,
        block_timestamp = EXCLUDED.block_timestamp,
        contract_type = EXCLUDED.contract_type,
        contract_address = EXCLUDED.contract_address,
        from_address = EXCLUDED.from_address,
        to_address = EXCLUDED.to_address,
        value = EXCLUDED.value,
        fee = EXCLUDED.fee,
        result = EXCLUDED.result,
        raw_data = EXCLUDED.raw_data;
    `;

        const values = [
            txData.txid,
            txData.info?.blockNumber || null,
            txData.info?.blockTimeStamp
                ? new Date(parseInt(txData.info.blockTimeStamp))
                : null,
            txData.contracts?.[0]?.type || null,
            extractContractAddress(txData),
            extractFromAddress(txData),
            extractToAddress(txData),
            txData.info?.log?.[0]?.data || null,
            txData.info?.fee || null,
            txData.info?.receipt?.result || null,
            JSON.stringify(txData),
        ];

        await client.query(query, values);
        console.log(
            `✅ Inserted transaction: ${txData.txid?.substring(0, 10)}...`
        );
    } catch (error) {
        console.error("❌ Error inserting transaction:", error);
    }
}

async function startStreaming() {
    console.log("🚀 Starting TRON substreams...");

    const contractAddress =
        process.env.CONTRACT_ADDRESS || "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
    const startBlock = process.env.START_BLOCK || "55000000";
    const endBlock = process.env.END_BLOCK || "55000100";

    console.log(`📡 Streaming from block ${startBlock} to ${endBlock}`);
    console.log(`🏦 Contract filter: ${contractAddress}`);

    const substreamsProcess = spawn(
        "substreams",
        [
            "run",
            "-e",
            "mainnet.tron.streamingfast.io:443",
            "-p",
            `filtered_transactions=contract_address:${contractAddress}`,
            "substreams.yaml",
            "filtered_transactions",
            "-s",
            startBlock,
            "-t",
            endBlock,
            "-o",
            "json",
        ],
        { stdio: ["pipe", "pipe", "pipe"] }
    );

    let buffer = "";

    substreamsProcess.stdout.on("data", (data) => {
        buffer += data.toString();

        // Try to parse complete JSON objects
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last incomplete line

        for (const line of lines) {
            if (line.trim() && line.startsWith("{")) {
                try {
                    const jsonData = JSON.parse(line);
                    if (jsonData["@data"] && jsonData["@data"].transactions) {
                        console.log(
                            `📦 Processing ${jsonData["@data"].transactions.length} transactions from block ${jsonData["@block"]}`
                        );

                        for (const transaction of jsonData["@data"]
                            .transactions) {
                            insertTransaction(transaction);
                        }
                    }
                } catch (parseError) {
                    console.error("❌ JSON parse error:", parseError.message);
                }
            }
        }
    });

    substreamsProcess.stderr.on("data", (data) => {
        console.log(`ℹ️ ${data.toString().trim()}`);
    });

    substreamsProcess.on("close", (code) => {
        console.log(`🏁 Substreams process finished with code ${code}`);
        client.end();
    });

    substreamsProcess.on("error", (error) => {
        console.error("❌ Substreams process error:", error);
        client.end();
    });
}

// Main execution
async function main() {
    await connectToDatabase();
    await startStreaming();
}

main().catch(console.error);
