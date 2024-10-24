const express = require('express');
const { Web3 } = require('web3');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Initialize web3 and connect to Ganache
const web3 = new Web3('http://127.0.0.1:7545');

// ABI and contract address for the deployed Vote contract
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "candidateNames",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "totalCandidates",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "totalVotesPerESP",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "voteRecords",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "candidate",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "esp8266Id",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "votes",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "position",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "esp8266Id",
        "type": "string"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "espId",
        "type": "string"
      }
    ],
    "name": "getVotesByESP",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "getVoteRecords",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint8",
            "name": "candidate",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "esp8266Id",
            "type": "string"
          }
        ],
        "internalType": "struct Vote6.VoteDetails[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "getVotes",
    "outputs": [
      {
        "internalType": "uint8[8]",
        "name": "",
        "type": "uint8[8]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "getCandidateNames",
    "outputs": [
      {
        "internalType": "string[8]",
        "name": "",
        "type": "string[8]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "getCandidateVotes",
    "outputs": [
      {
        "internalType": "string[8]",
        "name": "",
        "type": "string[8]"
      },
      {
        "internalType": "uint8[8]",
        "name": "",
        "type": "uint8[8]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];
const contractAddress = '0xfC4505b67Dc3aD99b873230e90eC196125C5d179'; // Contract address after deployment
const contract = new web3.eth.Contract(contractABI, contractAddress); // Connect to contract

const port = 3000;
let account; // To store account for transactions

// Fetch Ganache accounts (this will be the account used to send transactions)
web3.eth.getAccounts()
    .then(accounts => {
        account = accounts[0]; // Use the first account for transactions
    })
    .catch(error => {
        console.error('Error fetching accounts:', error);
    });

// Convert Unix timestamp to IST
function convertToIST(unixTimestamp) {
    // Ensure unixTimestamp is a number
    const date = new Date(Number(unixTimestamp) * 1000); // Convert seconds to milliseconds
    const offset = 5.5 * 60 * 60 * 1000; // IST offset (UTC+5:30) in milliseconds
    const istDate = new Date(date.getTime());

    return istDate.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    });
}

// Route to cast a vote (from ESP8266)
app.post('/vote/:position', async (req, res) => {
  const position = parseInt(req.params.position, 10); // Get candidate position from URL parameter
  const esp8266Id = req.body.esp8266Id; // ESP8266 ID passed in the body

  if (!esp8266Id) {
      return res.status(400).send('ESP8266 ID is required');
  }
  
  // Validate position
  if (position < 1 || position > 8) {
      return res.status(400).send('Position must be between 1 and 8');
  }

  if (!account) {
      return res.status(500).send('Account not available');
  }

  try {
      // Call the vote function on the contract
      await contract.methods.vote(position, esp8266Id).send({ 
        from: account,
        gas: 500000 // Increase this number if necessary
    });
    
      res.status(200).send(`Vote cast for candidate ${position} from ESP8266 ${esp8266Id}`);
  } catch (err) {
      console.error('Error while voting:', err);
      res.status(500).send('An error occurred during voting');
  }
});

// Route to get vote records
app.get('/voteRecords', async (req, res) => {
  try {
      // Call getVoteRecords method from the contract
      const voteRecords = await contract.methods.getVoteRecords().call();
      
      // Convert timestamp and format records
      const formattedVoteRecords = voteRecords.map(record => ({
          candidate: record.candidate.toString(),
          timestamp: convertToIST(Number(record.timestamp)), // Convert BigInt to number and then to IST
          esp8266Id: record.esp8266Id
      }));

      res.status(200).json({
          voteRecords: formattedVoteRecords
      });
  } catch (err) {
      console.error('Error fetching vote records:', err);
      res.status(500).send('An error occurred while fetching vote records');
  }
});

// Route to get candidate names and their votes
app.get('/candidates', async (req, res) => {
  try {
      // Call getCandidateNames method from the contract
      const candidateNames = await contract.methods.getCandidateNames().call();
      
      // Call getVotes method from the contract
      const votes = await contract.methods.getVotes().call();

      // Format the response
      const formattedCandidates = candidateNames.map((name, index) => ({
          name: name,
          votes: votes[index].toString() // Convert BigInt to string
      }));

      res.status(200).json({
          candidates: formattedCandidates
      });
  } catch (err) {
      console.error('Error fetching candidates:', err);
      res.status(500).send('An error occurred while fetching candidates');
  }
});

// Route to get candidate names
app.get('/candidateNames', async (req, res) => {
    try {
        // Call getCandidateNames method from the contract
        const names = await contract.methods.getCandidateNames().call();
        res.status(200).json({ candidateNames: names });
    } catch (err) {
        console.error('Error fetching candidate names:', err);
        res.status(500).send('An error occurred while fetching candidate names');
    }
});
app.get('/votes', async (req, res) => {
  try {
      // Call getVotes method from the contract
      const votes = await contract.methods.getVotes().call();
      const formattedVotes = votes.map(vote => vote.toString()); // Convert BigInt to string

      res.status(200).json({
          votes: formattedVotes, // Return all votes
          totalVotes: formattedVotes.reduce((acc, val) => acc + parseInt(val), 0) // Return total votes cast
      });
  } catch (err) {
      console.error('Error fetching votes:', err);
      res.status(500).send('An error occurred while fetching votes');
  }
});

// Start the server on port 3000
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
