// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Lottery
 */
contract Lottery {

    address private owner;
    address[] public currentParticipants;
    address[] public pastWinners;
    uint i = 0; // iteration of lottery draws
    uint fee;
    mapping(uint => mapping(address => bool)) public i_lotteryEntrants;
    /**
    *   The above can be split into into:
    *   mapping(address => bool)ws public lotteryEntrants;
    *   mapping(uint => lotteryEntrants) public iterations;
    */

    constructor ()  {
        owner = msg.sender;
        fee = 0.01 ether;
    }

    
    function getOwner() public view returns (address) {
        return owner;
    }
    
    modifier onlyOwner {
        require(msg.sender == owner, "Can only be sent by owner");
        _;
    }

    function getPot() public view returns (uint) {
        return address(this).balance;
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, i)));
    }

    function pickWinner() public onlyOwner {
        require(currentParticipants.length > 0, "No participants playing!");
        uint winnerIndex = random() % currentParticipants.length;
        address winner = currentParticipants[winnerIndex];
        payable(winner).transfer(getPot());
        pastWinners.push(winner);
        i++;
        delete currentParticipants;
    }

    function enterLottery() public payable {
        require(msg.value == fee, "Fee must be 0.01eth");
        require(!i_lotteryEntrants[i][msg.sender], "Already entered");
        currentParticipants.push(msg.sender);
        i_lotteryEntrants[i][msg.sender] = true;
    }

    function lastWinner() public view returns(address) {
        require(pastWinners.length > 0, "No past winner!");
        return pastWinners[pastWinners.length - 1];
    }
}