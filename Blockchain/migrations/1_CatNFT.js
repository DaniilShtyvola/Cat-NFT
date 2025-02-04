const CatNFT = artifacts.require("CatNFT");

module.exports = function (deployer) {
  deployer.deploy(CatNFT);
};