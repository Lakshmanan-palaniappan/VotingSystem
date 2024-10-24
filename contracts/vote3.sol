// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Vote6 {
    uint8 public constant totalCandidates = 8;
    uint8[8] public votes;

    string[8] public candidateNames = [
        "Candidate 1",
        "Candidate 2",
        "Candidate 3",
        "Candidate 4",
        "Candidate 5",
        "Candidate 6",
        "Candidate 7",
        "Candidate 8"
    ];

    struct VoteDetails {
        uint8 candidate;
        uint256 timestamp;
        string esp8266Id;
    }

    VoteDetails[] public voteRecords;

    mapping(string => uint8) public totalVotesPerESP;

    function vote(uint8 position, string memory esp8266Id) public {
        require(position >= 1 && position <= totalCandidates, "Position must be between 1 and 8");

        votes[position - 1] += 1;

        voteRecords.push(VoteDetails({
            candidate: position,
            timestamp: block.timestamp,
            esp8266Id: esp8266Id
        }));

        totalVotesPerESP[esp8266Id] += 1;
    }

    function getVotesByESP(string memory espId) public view returns (uint8) {
        return totalVotesPerESP[espId];
    }

    function getVoteRecords() public view returns (VoteDetails[] memory) {
        return voteRecords;
    }

    function getVotes() public view returns (uint8[8] memory) {
        return votes;
    }

    function getCandidateNames() public view returns (string[8] memory) {
        return candidateNames;
    }

    function getCandidateVotes() public view returns (string[8] memory, uint8[8] memory) {
        return (candidateNames, votes);
    }
}
