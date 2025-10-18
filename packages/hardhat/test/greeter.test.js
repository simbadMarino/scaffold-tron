const { expect } = require("chai");

describe("Greeter", () => {
  it("stores and returns the greeting", async () => {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello TRON!");
    await greeter.waitForDeployment();

    expect(await greeter.greet()).to.equal("Hello TRON!");

    const tx = await greeter.setGreeting("Yo");
    await tx.wait();
    expect(await greeter.greet()).to.equal("Yo");
  });
});
