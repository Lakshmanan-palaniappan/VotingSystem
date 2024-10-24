const Voting = artifacts.require("Vote6");
module.exports = function(deployer) {
  deployer.deploy(Voting);
};
