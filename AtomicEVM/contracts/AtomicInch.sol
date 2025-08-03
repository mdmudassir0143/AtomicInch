// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthereumHTLC {
    address public sender;
    address public receiver;
    bytes32 public hashlock;
    uint256 public timelock;
    bool public withdrawn;
    bool public refunded;
    bytes32 public secret;

    constructor(
        address _receiver,
        bytes32 _hashlock,
        uint256 _timelock
    ) payable {
        sender = msg.sender;
        receiver = _receiver;
        hashlock = _hashlock;
        timelock = block.timestamp + _timelock;
    }

    function withdraw(bytes32 _secret) external {
        require(msg.sender == receiver, "Not receiver");
        require(!withdrawn, "Already withdrawn");
        require(sha256(abi.encodePacked(_secret)) == hashlock, "Invalid secret");
        withdrawn = true;
        secret = _secret;
        payable(receiver).transfer(address(this).balance);
    }

    function refund() external {
        require(msg.sender == sender, "Not sender");
        require(block.timestamp >= timelock, "Timelock not passed");
        require(!withdrawn, "Already withdrawn");
        refunded = true;
        payable(sender).transfer(address(this).balance);
    }
}
