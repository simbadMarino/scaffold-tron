// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract Greeter {
    string private _greeting;
    constructor(string memory g) { _greeting = g; }
    function greet() external view returns (string memory) { return _greeting; }
    function setGreeting(string memory g) external { _greeting = g; }
}
