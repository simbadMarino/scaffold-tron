#!/usr/bin/env node

const { Client } = require("pg");

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
let totalProcessed = 0;
let totalInserted = 0;
let currentBlock = null;
let blockTransactionCounts = new Map();

// Buffer management
let buffer = "";
let braceCount = 0;
let processedObjects = 0;

// Memory management - trigger GC every 1000 processed objects
const GC_INTERVAL = 1000;

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("✅ Connected to PostgreSQL database");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
}

function hexToDecimal(hexString) {
    if (!hexString || hexString === "0x" || hexString === "0x0") return 0;
    try {
        return BigInt(hexString).toString();
    } catch (error) {
        console.warn(`⚠️  Invalid hex value: ${hexString}`);
        return 0;
    }
}

function extractTransactionValue(txData) {
    // Check if there's a direct value field
    if (txData.value) {
        return hexToDecimal(txData.value);
    }

    // Check contract parameters for value based on contract type
    if (txData.contracts && txData.contracts.length > 0) {
        const contract = txData.contracts[0];

        if (contract.parameter) {
            // TransferContract has amount in parameter.amount
            if (
                contract.type === "TransferContract" &&
                contract.parameter.amount
            ) {
                return contract.parameter.amount;
            }

            // TriggerSmartContract might have callValue
            if (
                contract.type === "TriggerSmartContract" &&
                contract.parameter.callValue
            ) {
                return contract.parameter.callValue;
            }

            // TransferAssetContract has amount
            if (
                contract.type === "TransferAssetContract" &&
                contract.parameter.amount
            ) {
                return contract.parameter.amount;
            }
        }
    }

    // Default to 0 if no value found
    return 0;
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
        raw_data = EXCLUDED.raw_data
    `;

        const blockTimestamp = new Date(
            parseInt(hexToDecimal(txData.blockTimestamp)) * 1000
        );

        const values = [
            txData.hash || txData.txid || "",
            hexToDecimal(txData.blockNumber) || currentBlock,
            blockTimestamp,
            txData.contractType || txData.contracts?.[0]?.type || "",
            txData.contractAddress || txData.info?.contractAddress || null,
            txData.fromAddress ||
                txData.contracts?.[0]?.parameter?.ownerAddress ||
                null,
            txData.toAddress ||
                txData.contracts?.[0]?.parameter?.toAddress ||
                null,
            extractTransactionValue(txData),
            hexToDecimal(txData.fee) || 0,
            txData.result || txData.ret?.[0]?.contractRet || "SUCCESS",
            JSON.stringify(txData),
        ];

        await client.query(query, values);
        totalInserted++;

        // Progress update every 50 transactions instead of 10
        if (totalInserted % 50 === 0 && totalInserted > 0) {
            const uniqueBlocks = blockTransactionCounts.size;
            console.log(
                `📊 Progress: ${totalInserted} inserted / ${totalProcessed} processed across ${uniqueBlocks} blocks`
            );
        }
    } catch (error) {
        console.error("❌ Error inserting transaction:", error);
        console.error("Transaction data:", JSON.stringify(txData, null, 2));
    }
}

function processBlock(blockData) {
    // Set current block from the @block field
    if (blockData["@block"]) {
        currentBlock = blockData["@block"];

        // Track unique blocks and their transaction counts
        if (!blockTransactionCounts.has(currentBlock)) {
            blockTransactionCounts.set(currentBlock, 0);
            console.log(`🔍 Processing new block ${currentBlock}`);
        }
    }

    // Process transactions from @data.transactions
    if (blockData["@data"] && blockData["@data"].transactions) {
        const transactions = blockData["@data"].transactions;
        return Promise.all(
            transactions.map(async (tx) => {
                totalProcessed++;
                const currentCount =
                    blockTransactionCounts.get(currentBlock) || 0;
                blockTransactionCounts.set(currentBlock, currentCount + 1);

                try {
                    await insertTransaction(tx);
                } catch (error) {
                    console.error(
                        `❌ Failed to insert transaction ${tx.hash}:`,
                        error.message
                    );
                }
            })
        );
    }
}

async function processStreamingData() {
    console.log("🔄 Starting real-time TRON transaction processing...");
    console.log(
        "📡 Reading from stdin - pipe substreams output to this script"
    );

    process.stdin.on("data", async (chunk) => {
        buffer += chunk.toString();

        // Try to parse complete JSON objects
        braceCount = 0;
        let start = 0;

        for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] === "{") {
                braceCount++;
            } else if (buffer[i] === "}") {
                braceCount--;
                if (braceCount === 0) {
                    if (braceCount === 0 && i > start) {
                        try {
                            const jsonStr = buffer.substring(start, i + 1);
                            const data = JSON.parse(jsonStr);

                            // Process the data if it contains transactions
                            if (data["@data"] && data["@data"].transactions) {
                                await processBlock(data);
                            }

                            // Memory management
                            processedObjects++;
                            if (processedObjects % GC_INTERVAL === 0) {
                                // Clear processed part of buffer
                                buffer = buffer.substring(i + 1);
                                start = 0;
                                i = 0;
                                braceCount = 0;

                                // Trigger garbage collection if available
                                if (global.gc) {
                                    global.gc();
                                }
                                continue;
                            }

                            start = i + 1;
                        } catch (error) {
                            console.error(
                                "❌ JSON parsing error:",
                                error.message
                            );
                            start = i + 1;
                        }
                    }
                }
            }
        }

        // Keep unprocessed data in buffer
        buffer = buffer.substring(start);
    });

    process.stdin.on("end", () => {
        console.log("\n✅ Processing complete!");
        console.log(
            `📊 Final stats: ${totalInserted} inserted / ${totalProcessed} processed across ${blockTransactionCounts.size} blocks`
        );
        const blocksProcessed = Array.from(blockTransactionCounts.keys()).sort(
            (a, b) => a - b
        );
        if (blocksProcessed.length > 0) {
            console.log(
                `📦 Blocks processed: ${blocksProcessed[0]} - ${
                    blocksProcessed[blocksProcessed.length - 1]
                }`
            );
        }
        client.end();
        process.exit(0);
    });

    // Handle process termination
    process.on("SIGINT", () => {
        console.log("🛑 Stopping stream...");
        console.log(
            `📊 Final stats: ${totalInserted} inserted / ${totalProcessed} processed across ${blockTransactionCounts.size} blocks`
        );
        const blocksProcessed = Array.from(blockTransactionCounts.keys()).sort(
            (a, b) => a - b
        );
        if (blocksProcessed.length > 0) {
            console.log(
                `📦 Blocks processed: ${blocksProcessed[0]} - ${
                    blocksProcessed[blocksProcessed.length - 1]
                }`
            );
        }
        client.end();
        process.exit(0);
    });
}

// Main execution
async function main() {
    await connectToDatabase();
    await processStreamingData();
}

main().catch(console.error);
