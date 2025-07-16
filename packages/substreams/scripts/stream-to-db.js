#!/usr/bin/env node

const { spawn } = require("child_process");
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
            txData.info?.contractAddress || null,
            txData.contracts?.[0]?.parameter?.ownerAddress || null,
            null, // to_address - will extract from logs
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
