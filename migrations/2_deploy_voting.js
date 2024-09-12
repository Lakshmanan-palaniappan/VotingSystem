const Voting = artifacts.require("Vote");
module.exports = function(deployer) {
  deployer.deploy(Voting);
};
