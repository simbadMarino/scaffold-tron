//SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

//Simple contract call gateway demo
//Purpose: Prove wether or not external calls to sponsored contracts uses original deployer energy or not.abi

interface Stakev2_0 {
    function calculateEnergyPerTRX() external returns (uint256);
}

contract callGateway {
    function callExternal(address energyPoolContract) external {
        Stakev2_0(energyPoolContract).calculateEnergyPerTRX();
    }
}
