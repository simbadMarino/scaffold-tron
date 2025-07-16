#!/usr/bin/env node

const fs = require("fs");
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

async function processJsonFile(filename) {
    try {
        const data = fs.readFileSync(filename, "utf8");
        const lines = data.split("\n");

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
                            await insertTransaction(transaction);
                        }
                    }
                } catch (parseError) {
                    console.error("❌ JSON parse error:", parseError.message);
                }
            }
        }
    } catch (error) {
        console.error("❌ Error reading file:", error);
    }
}

// Main execution
async function main() {
    await connectToDatabase();
    await processJsonFile("/tmp/tron_output.json");
    await client.end();
    console.log("🏁 Processing complete!");
}

main().catch(console.error);
