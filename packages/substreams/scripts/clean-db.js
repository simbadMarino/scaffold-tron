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

async function cleanDatabase() {
    const client = new Client(dbConfig);

    try {
        await client.connect();
        console.log("✅ Connected to PostgreSQL database");

        // Get current count
        const countResult = await client.query(
            "SELECT COUNT(*) FROM tron_transactions"
        );
        const currentCount = parseInt(countResult.rows[0].count);

        if (currentCount === 0) {
            console.log("🧹 Database is already clean (0 transactions)");
            return;
        }

        console.log(`🧹 Found ${currentCount} transactions to clean...`);

        // Truncate the table (faster than DELETE)
        await client.query("TRUNCATE TABLE tron_transactions RESTART IDENTITY");

        console.log("✅ Database cleaned successfully!");
        console.log("🎯 Ready for fresh demo data");
    } catch (error) {
        console.error("❌ Failed to clean database:", error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Handle process termination
process.on("SIGINT", async () => {
    console.log("\n🛑 Cleaning interrupted");
    process.exit(0);
});

// Run the cleanup
cleanDatabase().catch((error) => {
    console.error("❌ Cleanup failed:", error.message);
    process.exit(1);
});
