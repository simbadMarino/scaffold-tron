// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

//Simple smart contract showcasing a loose version of SafeTransfer.
//OpenZeppelin SafeTRansfer cannot be implemented on TRON because USDT transfer functions
//returns nothing (void) as explained in:  http://solidity123.com/solidity-error-survey/tron-usdt-safetransfer.html

interface ITRC20 {
    function transfer(address to, uint256 amount) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

event DebugTransfer(bool success, bytes data, uint256 dataLength);


contract safeTransferTRON {
    //Sample function which transfers a token (e.g. USDT) to sender address

    function withdrawUSDT(address tokenAddress, uint256 amount) external {
        safeTransferLoose(ITRC20(tokenAddress), msg.sender, amount);
    }

    function withdrawSimpleUSDT(address tokenAddress, uint256 amount) external {
        simpleTransfer(ITRC20(tokenAddress), msg.sender, amount);
    }



   function safeTransferLoose(ITRC20 token, address to, uint256 value) internal {
    address self;
    //optional: uint256 balanceBefore = token.balanceOf(to);  

    assembly{
        self:= address()
    }
    // Check balance
    uint256 balance = token.balanceOf(address(self));
    require(balance >= value, "Insufficient token balance");

    // Check recipient isn't zero address
    require(to != address(0), "Transfer to zero address");

    (bool success, bytes memory data) = address(token).call(abi.encodeWithSelector(token.transfer.selector, to, value));
    require(success, "Low-level transfer failed");

    // Optional: Verify actual balance change, most secure but higher gas consumption
    //uint256 balanceAfter = token.balanceOf(to);
    //require(balanceAfter >= balanceBefore + value, "Balance not updated");

    // Debuggin:
    emit DebugTransfer(success, data, data.length);

}

function simpleTransfer(ITRC20 token, address to, uint256 value) internal {
    token.transfer(to,value);

}
}


