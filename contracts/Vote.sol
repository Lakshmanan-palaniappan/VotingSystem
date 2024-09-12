// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Vote {
    uint8[8] public votes;
    function vote(uint8 position) public {
        require(position >= 1 && position <= 8, "Position must be between 1 and 8");
        votes[position - 1] += 1;
    }
    function getVotes() public view returns (uint8[8] memory) {
        return votes;
    }
}
