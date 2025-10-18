//Not used, Scafold TRON will deploy using tronweb in depoyTronContract.js script
const MyContract = artifacts.require('');

module.exports = function (deployer) {
  console.log("Please use yarn tron:deploy instead");
  //deployer.deploy(MyContract);
};
