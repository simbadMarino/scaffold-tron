const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const YourContract = artifacts.require("YourContract");

contract("YourContract", accounts => {
  let yourContract;

  beforeEach(async () => {
    yourContract = await YourContract.deployed();
  });

  describe("deployment", () => {
    it("deploys successfully", async () => {
      const address = await yourContract.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("has the correct owner", async () => {
      const owner = await yourContract.owner();
      // Convert hex address to base58 for comparison
      const ownerBase58 = tronWeb.address.fromHex(owner);
      const expectedOwner = tronWeb.address.fromPrivateKey(process.env.TRON_PRIVATE_KEY_SHASTA);
      assert.equal(ownerBase58, expectedOwner);
    });

    it("has the correct initial greeting", async () => {
      const greeting = await yourContract.greeting();
      assert.equal(greeting, "Building Unstoppable Apps!!!");
    });
  });

  describe("setGreeting", () => {
    it("allows setting a new greeting", async () => {
      const newGreeting = "Hello from Tron!";
      await yourContract.setGreeting(newGreeting);
      const greeting = await yourContract.greeting();
      assert.equal(greeting, newGreeting);
    });

    it("increments the totalCounter", async () => {
      const initialCount = await yourContract.totalCounter();
      await yourContract.setGreeting("Test greeting");
      const newCount = await yourContract.totalCounter();
      // Convert BigNumber to regular number for comparison
      assert.equal(parseInt(newCount), parseInt(initialCount) + 1);
    });

    it("increments the user greeting counter", async () => {
      const userAddress = tronWeb.defaultAddress.hex;
      const initialCount = await yourContract.userGreetingCounter(userAddress);
      await yourContract.setGreeting("Another test greeting");
      const newCount = await yourContract.userGreetingCounter(userAddress);
      // Convert BigNumber to regular number for comparison
      assert.equal(parseInt(newCount), parseInt(initialCount) + 1);
    });

    it("sets premium to true when value is sent", async () => {
      // Send 1 TRX (1,000,000 SUN) with the transaction
      await yourContract.setGreeting("Premium greeting", {
        callValue: 1000000, // 1 TRX in SUN
      });
      const premium = await yourContract.premium();
      assert.equal(premium, true);
    });

    it("sets premium to false when no value is sent", async () => {
      await yourContract.setGreeting("Free greeting");
      const premium = await yourContract.premium();
      assert.equal(premium, false);
    });
  });
});
