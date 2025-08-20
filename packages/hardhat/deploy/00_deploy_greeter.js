/** @type {import('hardhat-deploy/types').DeployFunction} */
const func = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy('Greeter', {
    from: deployer,
    args: ['Hello TRON!'],
    log: true,
  });
};
module.exports = func;
module.exports.tags = ['Greeter'];
