//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Version 1 deployed to Goerli at:  0x77C45ADB236098efB0D4D318F518B2C86E827938
// Version 2 (with setNewOwner) deployed to Goerli at:  0x5340d0d6C55B6b3EeFbdB806ca427AEd2743fB82

contract BuyMeACoffee {
    // Event emitted when a Memo is created
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    // Memo struct
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    // List of all memos received from friends
    Memo[] memos;

    // Addresses of the contract deployer
    address payable owner;

    // Only runs once when the contract is deployed
    constructor() {
        owner = payable(msg.sender);
    }

    /**
    * @dev buy a coffee for contract owner
    * @param _name name of the coffee buyer
    * @param _message message to be sent from the buyer
    */
    function buyCoffee(string memory _name, string memory _message) public payable {
        require(msg.value > 0, "Can't buy a coffee with 0 ETH");

        // Add the memo to storage
        memos.push(Memo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        ));

        // Emit a log event when a new memo is created!
        emit NewMemo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        );
    }

    /**
    * @dev send the entire balance straight to the owner
    */
    function withdrawTips() public {
        require(owner.send(address(this).balance));
    }

    /**
    * @dev retrieve the list of memos received and stored in the contract
    */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }

    /**
    * @dev set a new owner for the contract
    * @param _newOwner new owner of the contract
    */
    function setNewOwner(address payable _newOwner) public {
        require(msg.sender == owner, "Only the owner can set the new owner!");
        owner = _newOwner;
    }
}
