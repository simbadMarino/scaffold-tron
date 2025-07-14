#!/usr/bin/env node

console.log("Testing TronWeb import...");

// Test 1: Regular require
try {
  const TronWeb = require("tronweb");
  console.log("✅ Regular require works");
  console.log("TronWeb type:", typeof TronWeb);
  console.log("TronWeb.default type:", typeof TronWeb.default);
  console.log("TronWeb keys:", Object.keys(TronWeb));

  // Test constructor
  if (typeof TronWeb === "function") {
    console.log("✅ TronWeb is a function (constructor)");
  } else if (typeof TronWeb.default === "function") {
    console.log("✅ TronWeb.default is a function (constructor)");
  } else {
    console.log("❌ No constructor found");
  }
} catch (error) {
  console.log("❌ Regular require failed:", error.message);
}

// Test 2: ES6 import (async)
(async () => {
  try {
    const TronWebModule = await import("tronweb");
    console.log("✅ ES6 import works");
    console.log("TronWebModule type:", typeof TronWebModule);
    console.log("TronWebModule.default type:", typeof TronWebModule.default);
    console.log("TronWebModule keys:", Object.keys(TronWebModule));

    // Test constructor
    if (typeof TronWebModule.default === "function") {
      console.log("✅ TronWebModule.default is a function (constructor)");
    } else if (typeof TronWebModule === "function") {
      console.log("✅ TronWebModule is a function (constructor)");
    } else {
      console.log("❌ No constructor found in ES6 import");
    }
  } catch (error) {
    console.log("❌ ES6 import failed:", error.message);
  }
})();

// Test 3: Test actual instantiation
(async () => {
  try {
    const TronWeb = require("tronweb");
    const Constructor = TronWeb.default || TronWeb;

    if (typeof Constructor === "function") {
      const instance = new Constructor({
        fullHost: "https://api.shasta.trongrid.io",
        solidityNode: "https://api.shasta.trongrid.io",
        eventServer: "https://api.shasta.trongrid.io",
      });

      console.log("✅ TronWeb instance created successfully");
      console.log("Instance type:", typeof instance);
      console.log("Instance keys:", Object.keys(instance));
    } else {
      console.log("❌ Cannot create instance - no constructor");
    }
  } catch (error) {
    console.log("❌ Instance creation failed:", error.message);
  }
})();
