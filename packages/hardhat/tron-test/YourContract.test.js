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
      assert.equal(owner, accounts[0]);
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
      assert.equal(newCount.toNumber(), initialCount.toNumber() + 1);
    });

    it("increments the user greeting counter", async () => {
      const initialCount = await yourContract.userGreetingCounter(accounts[0]);
      await yourContract.setGreeting("Another test greeting");
      const newCount = await yourContract.userGreetingCounter(accounts[0]);
      assert.equal(newCount.toNumber(), initialCount.toNumber() + 1);
    });

    it("sets premium to true when value is sent", async () => {
      await yourContract.setGreeting("Premium greeting", { value: 1000000 });
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
