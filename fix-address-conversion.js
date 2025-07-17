#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const TronWeb = require("tronweb").TronWeb;

// Current hex address from deployment
const currentHexAddress = "411510062d5a95cb1383da337ca1b8be567f61ab5f";

async function fixAddressConversion() {
    console.log("🔄 Converting hex address to base58...");
    console.log("Current hex address:", currentHexAddress);

    // Initialize TronWeb
    const tronWeb = new TronWeb({
        fullHost: "https://api.shasta.trongrid.io",
        privateKey:
            "0000000000000000000000000000000000000000000000000000000000000001",
    });

    try {
        // Convert hex to base58
        const hexWithPrefix = "0x" + currentHexAddress;
        const base58Address = tronWeb.address.fromHex(hexWithPrefix);

        console.log("✅ Converted to base58:", base58Address);
        console.log("Address length:", base58Address.length);
        console.log("Starts with T:", base58Address.startsWith("T"));
        console.log("Is valid:", tronWeb.isAddress(base58Address));

        // Update tron-deployments.json
        const deploymentsPath = path.join(
            "..",
            "nextjs",
            "tron-deployments.json"
        );
        let deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));

        deployments["2494104990"].YourContract.addressBase58 = base58Address;

        fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
        console.log("📄 Updated tron-deployments.json");

        // Generate new deployedTronContracts.ts
        const {
            generateTronContractsFile,
        } = require("./scripts/generateTronContractsTs");
        generateTronContractsFile();
        console.log("📄 Updated deployedTronContracts.ts");

        console.log(
            "🔗 New TronScan URL:",
            `https://shasta.tronscan.org/#/contract/${base58Address}`
        );
    } catch (error) {
        console.error("❌ Conversion failed:", error.message);
    }
}

fixAddressConversion().catch(console.error);
