//SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

/*
TRON  TRON Cell Manager Contract (TCMC) requirements:

Goal: 
1. Create a SC in such a way that developer can build a TRON Resources delegation automation platform, flash rentals trough external TRON EOAs should be enabled as well

Usual Workflow:


Background:


Identified Use Cases:

1. TRON Energy Pool/Cell/Battery 

Contract Requirements:
2. Only Owner can change owner address --> Done
4. Only Owner must be able to withdraw TRX -> 
5. Optionally Add a white list function for users to avoid smart contract abuse beyond the owner's platform. -> Pending
6. Implement Error handling, feedback and logging for all functions --> Pending
7. Create Smart contract test cases --> Pending
8. Only white-listed users can delegate resources -->
9. White-listed users have a configurable max resource they can access per day (consider block number per day here)

TO-DO:

*/

contract TronCellManager {
    address internal owner;
    uint256 public energyPerTRX;
    uint256 public netPerTRX;

    event TransferExecuted(address indexed from, address indexed to, uint256 amount);
    error InvalidResourceType(uint8 resourceType);
    error InvalidAmountOrPriceNotInitialized();
    error UnDelegateCallFailed();

    event BalanceFreezedV2(uint, uint);
    event ResourcePerTRXEvent(uint256);
    event BalanceUnfreezedV2(uint, uint);
    event AllUnFreezeV2Canceled();
    event ExpireUnfreezeWithdrew(uint);
    event ResourceDelegated(
        address indexed caller,
        address indexed delegateTo,
        uint256 amount,
        uint8 resourceType,
        uint256 timestamp
    );
    event ResourceUnDelegated(
        address indexed caller,
        address indexed delegateTo,
        uint256 amount,
        uint8 resourceType,
        uint256 timestamp
    );
    event withdrawnBalance(address indexed recipient, uint amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner may call function");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    /**
     * @notice Query the amount of resources share of a specific resourceType delegated by from to address
     * @param to delegated resource to address
     * @param from resource owner
     * @param resourceType Energy: 1 , Bandwidth: 0
     */
    function getResourceV2(address to, address from, uint8 resourceType) public view returns (uint) {
        if (resourceType != 0 && resourceType != 1) revert InvalidResourceType(resourceType);
        return to.resourceV2(from, resourceType);
    }

    /**
     * @notice Delegate Resource in Resource units
     * @param amountInRes Amount of resource to be delegated
     * @param resourceType Energy: 1  Bandwidth: 0
     * @param delegateTo to address
     */
    function delegateResource(
        uint amountInRes,
        uint8 resourceType, //Energy: 1 , Bandwidth: 0
        address payable delegateTo
    ) public {
        if (amountInRes == 0 && energyPerTRX == 0 && netPerTRX == 0) revert InvalidAmountOrPriceNotInitialized();
        if (resourceType > 1) revert InvalidResourceType(resourceType); //If Wrong input by user revert
        uint amountInTRX;
        unchecked {
            if (resourceType == 1) {
                amountInTRX = (amountInRes * 1_000_000_000_000) / energyPerTRX;
            } else if (resourceType == 0) {
                amountInTRX = (amountInRes * 1_000_000_000_000) / netPerTRX;
            }
        }

        delegateTo.delegateResource(amountInTRX, resourceType);
        emit ResourceDelegated(msg.sender, delegateTo, amountInRes, resourceType, block.timestamp);
    }

    function quickEnergyDelegation(address payable delegateTo) external {
        delegateResource(5000000, 1, delegateTo);
        emit ResourceDelegated(msg.sender, delegateTo, 66000000000, 1, block.timestamp);
    }

    function unDelegateResource(
        uint amount,
        uint8 resourceType, //Energy: 1 , Bandwidth: 0
        address payable delegateTo
    ) external {
        if (amount == 0) revert InvalidAmountOrPriceNotInitialized();
        if (resourceType != 0 && resourceType != 1) revert InvalidResourceType(resourceType);
        delegateTo.unDelegateResource(amount, resourceType);
        emit ResourceUnDelegated(msg.sender, delegateTo, amount, resourceType, block.timestamp);
    }

    // Stake TRX to obtain Voting power and Resources (Either Energy: 1 or Bandwidth:0)
    function freezeBalance(
        uint amount,
        uint8 resourceType //Energy: 1 , Bandwidth: 0
    ) external {
        if (resourceType != 0 && resourceType != 1) revert InvalidResourceType(resourceType);
        freezebalancev2(amount, resourceType);
        emit BalanceFreezedV2(amount, resourceType);
    }

    // unstake TRX
    function unfreezeBalance(uint amount, uint8 resourceType) external {
        if (resourceType != 0 && resourceType != 1) revert InvalidResourceType(resourceType);
        unfreezebalancev2(amount, resourceType);
        emit BalanceUnfreezedV2(amount, resourceType);
    }

    // Function to withdraw TRX (native TRON currency) from the wallet to a specified address
    function withdrawBalance(
        uint amount, // Amount of TRX to withdraw
        address payable _address // Recipient's address
    ) external onlyOwner {
        // Only the owner can call this function
        _address.transfer(amount);
        emit withdrawnBalance(owner, amount);
    }

    /**
     * @notice  Get Chain parameters , remove to reduce deployment cost for now
     */
    /*function getChainParameters()
        public
        view
        returns (uint, uint, uint, uint, uint)
    {
        return (
            chain.totalNetLimit,
            chain.totalNetWeight,
            chain.totalEnergyCurrentLimit,
            chain.totalEnergyWeight,
            chain.unfreezeDelayDays
        );
    }*/

    /**
     * @notice  Calculate the Energy per TRX ratio considering current Network conditions
     */
    function calculateEnergyPerTRX() public returns (uint) {
        energyPerTRX = (chain.totalEnergyCurrentLimit * 1_000_000) / chain.totalEnergyWeight;
        emit ResourcePerTRXEvent(energyPerTRX);
        return (energyPerTRX);
    }

    /**
     * @notice  Calculate the Bandwidth per TRX ratio considering current Network conditions
     */
    function calculateNetPerTRX() public returns (uint) {
        netPerTRX = (chain.totalNetLimit * 1_000_000) / chain.totalNetWeight;
        emit ResourcePerTRXEvent(netPerTRX);
        return (netPerTRX);
    }

    /**
     * @notice cancel all pending unstaking requests. Before calling selfdestruct(address) to destroy the contract, should cancel all pending unstaking requests, otherwise, the contract cannot be destroyed.
     */
    function cancelUnfreeze() external {
        cancelallunfreezev2();
        emit AllUnFreezeV2Canceled();
    }

    /**
     * @notice withdraw unfrozen TRX, the user can call this API to withdraw funds to account after executing unfreezeBalanceV2 transaction and waiting N days, N is a network parameter.
     */
    function withdrawExpireUnfreeze() external {
        uint256 amount = withdrawexpireunfreeze();
        emit ExpireUnfreezeWithdrew(amount);
    }

    /**
     * @notice Query the usage of a specific resourceType of resources for address
     * @param to Address to be analyzed
     * @param resourceType Energy: 1 , Bandwidth: 0
     */
    function getResourceUsage(
        address to,
        uint8 resourceType //Energy: 1 , Bandwidth: 0
    ) public view returns (uint, uint) {
        (uint used, uint restoreTime) = to.resourceUsage(resourceType);
        return (used, restoreTime);
    }

    /**
     * @notice Query the total available resource share of a specific resourceType for address
     * @param to Address to be analyzed
     * @param resourceType Energy: 1 , Bandwidth: 0
     */
    function getTotalResource(
        address to,
        uint8 resourceType //Energy: 1 , Bandwidth: 0
    ) public view returns (uint) {
        if (resourceType != 0 && resourceType != 1) revert InvalidResourceType(resourceType);
        return to.totalResource(resourceType);
    }

    /**
     * @notice Query delegated resources share of a specific resourceType for address
     * @param to Address to be analyzed
     * @param resourceType Energy: 1 , Bandwidth: 0
     */
    function getTotalDelegatedResource(address to, uint8 resourceType) public view returns (uint) {
        if (resourceType != 1 && resourceType != 0) revert InvalidResourceType(resourceType);
        return to.totalDelegatedResource(resourceType);
    }

    /**
     * @notice Query the acquired resource share of a specific resourceType for address
     * @param to Address to be analyzed
     * @param resourceType Energy: 1 , Bandwidth: 0
     * @return The amount of acquired resource share, the unit is sun
     */
    function getTotalAcquiredResource(address to, uint8 resourceType) public view returns (uint) {
        return to.totalAcquiredResource(resourceType);
    }

    /**
     * @notice Vote witness in srList array and every witness will get correspond TP in tpList array
     * @param srList SR List
     * @param tpList Number of votes for super representatives in srList
     */
    function voteWitness(address[] calldata srList, uint[] calldata tpList) external {
        vote(srList, tpList);
    }

    /**
     * @notice  Withdraw all allowance and reward to contract balance
     * @return Actually withdrawn balance of allowance and reward. unit is sun.
     */
    function withdrawReward() external returns (uint) {
        return withdrawreward();
    }

    /**
     * @notice  Query all allowance and reward of contract account
     * @return Sum of allowance and reward of contradct account
     */
    function queryRewardBalance() external view returns (uint) {
        return rewardBalance();
    }

    function changeOwner(address _newOwnerAddress) external onlyOwner {
        owner = _newOwnerAddress;
    }
}
