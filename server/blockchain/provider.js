/**
 * Shared ethers provider / signer factory.
 * Singleton provider avoids opening a new JSON-RPC connection per request.
 */
const { ethers } = require('ethers');
const config = require('./config');

let providerInstance = null;

function getProvider() {
  if (!providerInstance) {
    providerInstance = new ethers.providers.JsonRpcProvider(config.rpcUrl, {
      name: config.name,
      chainId: config.chainId,
    });
  }
  return providerInstance;
}

function getOptionalSigner() {
  if (!config.privateKey) return null;
  return new ethers.Wallet(config.privateKey, getProvider());
}

function getContract(address, abi, withSigner = false) {
  const provider = getProvider();
  const signer = withSigner ? getOptionalSigner() : null;
  const runner = signer || provider;
  return new ethers.Contract(address, abi, runner);
}

module.exports = {
  getProvider,
  getOptionalSigner,
  getContract,
};
