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

        // Function to convert hex to decimal
        function hexToDecimal(hexString) {
            if (!hexString || hexString === "0x") return null;
            try {
                return BigInt(hexString).toString();
            } catch (error) {
                console.error(
                    "Error converting hex to decimal:",
                    hexString,
                    error
                );
                return null;
            }
        }

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
            hexToDecimal(txData.info?.log?.[0]?.data), // Convert hex value to decimal
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
        const jsonData = JSON.parse(data);

        if (jsonData["@data"] && jsonData["@data"].transactions) {
            console.log(
                `📦 Processing ${jsonData["@data"].transactions.length} transactions from block ${jsonData["@block"]}`
            );

            for (const transaction of jsonData["@data"].transactions) {
                await insertTransaction(transaction);
            }
        }
    } catch (error) {
        console.error("❌ Error processing file:", error);
    }
}

// Main execution
async function main() {
    await connectToDatabase();
    await processJsonFile("/tmp/single_block.json");
    await client.end();
    console.log("🏁 Processing complete!");
}

main().catch(console.error);
