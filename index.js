const express = require('express');
const {Web3} = require('web3');
const app = express();
const cors = require('cors');
app.use(cors());


app.use(express.json());

const web3 = new Web3('http://127.0.0.1:7545'); 
const contractABI = [
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
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
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
    }
];

const contractAddress = '0xC390e84258d1a844d46b91d8D6a22a7Df004d2F6';
const contract = new web3.eth.Contract(contractABI, contractAddress);
const port = 3000;
let account;
web3.eth.getAccounts().then(accounts => {
   account = accounts[0]; 
}).catch(error => {
   console.error('Error fetching accounts:', error);
});
app.post('/vote/:position', async (req, res) => {
   const position = parseInt(req.params.position, 10);
    
   if (position < 1 || position > 8) {
      return res.status(400).send('Position must be between 1 and 8');
   }

   if (!account) {
      return res.status(500).send('Account not available');
   }

   try {
      await contract.methods.vote(position).send({ from: account });
      res.status(200).send(`Vote incremented for position ${position}`);
   } catch (err) {
      console.error('Error while voting:', err);
      res.status(500).send('An error occurred');
   }
});
app.get('/votes', async (req, res) => {
    try {
       const votes = await contract.methods.getVotes().call();
       const formattedVotes = votes.map(vote => vote.toString());
       
       res.status(200).json(formattedVotes);
    } catch (err) {
       console.error('Error fetching votes:', err);
       res.status(500).send('An error occurred');
    }
 });
app.listen(port, () => {
   console.log(`Server running on http://localhost:${port}`);
});
