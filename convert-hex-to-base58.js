#!/usr/bin/env node

// Change to hardhat directory to access tronweb
process.chdir("./packages/hardhat");

const TronWeb = require("tronweb").TronWeb;

const hexAddress = "41ef4617a126fb592033e52ceda97ce87f7775a484";

const tronWeb = new TronWeb({
    fullHost: "https://api.shasta.trongrid.io",
    privateKey:
        "0000000000000000000000000000000000000000000000000000000000000001",
});

try {
    const base58Address = tronWeb.address.fromHex("0x" + hexAddress);
    console.log("Hex address:", hexAddress);
    console.log("Base58 address:", base58Address);
    console.log("Is valid:", tronWeb.isAddress(base58Address));
} catch (error) {
    console.error("Conversion failed:", error.message);
}
