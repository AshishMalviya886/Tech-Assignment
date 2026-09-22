/**
 * Blockchain network & contract configuration.
 *
 * Addresses are env-driven so the same API can target local Hardhat,
 * Sepolia, or mainnet without code changes — key for scalability.
 */
require('dotenv').config();

const ZERO = '0x0000000000000000000000000000000000000000';

const networks = {
  localhost: {
    chainId: 31337,
    name: 'Hardhat / Local',
    rpcUrl: process.env.LOCAL_RPC_URL || 'http://127.0.0.1:8545',
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
  },
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.MAINNET_RPC_URL || 'https://eth.llamarpc.com',
  },
};

const activeNetwork = process.env.BLOCKCHAIN_NETWORK || 'localhost';

if (!networks[activeNetwork]) {
  throw new Error(
    `Unknown BLOCKCHAIN_NETWORK "${activeNetwork}". Use: ${Object.keys(networks).join(', ')}`
  );
}

const config = {
  network: activeNetwork,
  ...networks[activeNetwork],
  contracts: {
    realEstate: process.env.REAL_ESTATE_ADDRESS || ZERO,
    escrow: process.env.ESCROW_ADDRESS || ZERO,
  },
  /** Optional server-side signer for privileged ops (inspector, etc.) */
  privateKey: process.env.SERVER_WALLET_PRIVATE_KEY || null,
  isAddressConfigured(address) {
    return Boolean(address) && address.toLowerCase() !== ZERO.toLowerCase();
  },
};

module.exports = config;
