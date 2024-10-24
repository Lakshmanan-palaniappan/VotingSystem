// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Vote4 {
    uint8 public constant totalCandidates = 8;  // Fixed number of candidates
    uint8[8] public votes;  // Array to store votes for each candidate

    // Array to hold candidate names
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

    // Structure to store vote details
    struct VoteDetails {
        uint8 candidate;  // Candidate voted for (1 to 8)
        uint256 timestamp;  // Time of vote (block timestamp)
        string esp8266Id;  // ESP8266 ID (e.g., "espEVM1")
    }

    // Array to hold all vote records
    VoteDetails[] public voteRecords;

    // Mapping to track total votes per ESP8266 (by their ID)
    mapping(string => uint8) public totalVotesPerESP;

    // Function to cast a vote
    function vote(uint8 position, string memory espId) public {
        require(position >= 1 && position <= totalCandidates, "Position must be between 1 and 8");

        // Increment the vote for the chosen candidate
        votes[position - 1] += 1;

        // Add vote details to the record
        voteRecords.push(VoteDetails({
            candidate: position,
            timestamp: block.timestamp,
            esp8266Id: espId
        }));

        // Increment the total votes for this ESP8266
        totalVotesPerESP[espId] += 1;
    }

    // Function to get total votes for a specific ESP8266
    function getVotesByESP(string memory espId) public view returns (uint8) {
        return totalVotesPerESP[espId];
    }

    // Function to get the details of all votes (candidate, timestamp, and ESP ID)
    function getVoteRecords() public view returns (VoteDetails[] memory) {
        return voteRecords;
    }

    // Function to get total votes for all candidates
    function getVotes() public view returns (uint8[8] memory) {
        return votes;
    }

    // Function to get candidate names
    function getCandidateNames() public view returns (string[8] memory) {
        return candidateNames;
    }
}
