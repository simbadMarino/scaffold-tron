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

function hexToDecimal(hexString) {
    if (!hexString || hexString === "0x" || hexString === "0x0") return 0;
    try {
        return BigInt(hexString).toString();
    } catch (error) {
        console.warn(`⚠️  Invalid hex value: ${hexString}`);
        return 0;
    }
}

async function fixTransactionValues() {
    const client = new Client(dbConfig);

    try {
        await client.connect();
        console.log("✅ Connected to database");

        // Get all transactions with their raw data
        const result = await client.query(`
            SELECT id, transaction_hash, value, raw_data, contract_type
            FROM tron_transactions 
            ORDER BY id
        `);

        console.log(`📊 Found ${result.rows.length} transactions to process`);

        let updatedCount = 0;
        let unchangedCount = 0;

        for (const row of result.rows) {
            const currentValue = BigInt(row.value || 0);
            const rawData = row.raw_data;
            const newValue = BigInt(extractTransactionValue(rawData));

            if (newValue !== currentValue) {
                // Update the transaction with the correct value
                await client.query(
                    `UPDATE tron_transactions SET value = $1 WHERE id = $2`,
                    [newValue.toString(), row.id]
                );

                console.log(
                    `🔄 Updated ${row.transaction_hash.substring(0, 10)}... (${
                        row.contract_type
                    }): ${currentValue} → ${newValue}`
                );
                updatedCount++;
            } else {
                unchangedCount++;
            }
        }

        console.log(`\n✅ Processing complete:`);
        console.log(`   - Updated: ${updatedCount} transactions`);
        console.log(`   - Unchanged: ${unchangedCount} transactions`);

        // Show some sample updated values
        if (updatedCount > 0) {
            console.log(`\n📋 Sample of updated transactions:`);
            const sampleResult = await client.query(`
                SELECT transaction_hash, contract_type, value
                FROM tron_transactions 
                WHERE value > 0
                ORDER BY value DESC
                LIMIT 5
            `);

            for (const row of sampleResult.rows) {
                const trxValue = (
                    BigInt(row.value) / BigInt(1000000)
                ).toString();
                console.log(
                    `   - ${row.transaction_hash.substring(0, 10)}... (${
                        row.contract_type
                    }): ${trxValue} TRX`
                );
            }
        }
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await client.end();
    }
}

fixTransactionValues();
