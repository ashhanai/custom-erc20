const AshhanaiToken = artifacts.require("AshhanaiToken");

module.exports = function (deployer) {
  deployer.deploy(AshhanaiToken, 1000000);
};
