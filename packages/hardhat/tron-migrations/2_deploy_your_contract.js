const YourContract = artifacts.require("YourContract");

module.exports = function (deployer, network, accounts) {
  // Deploy YourContract with the deployer account as owner
  deployer.deploy(YourContract, accounts[0]);
};
