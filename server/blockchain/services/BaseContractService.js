/**
 * Base helpers shared by all contract services.
 *
 * Design notes:
 * - Read methods hit the RPC directly (stateless, horizontally scalable).
 * - Write methods return *unsigned* transaction payloads so the user's wallet
 *   signs on the client — the API never holds user keys.
 * - Optional server signer can execute privileged roles when configured.
 */
const { ethers } = require('ethers');
const { getContract, getProvider } = require('../provider');
const config = require('../config');

class ContractNotConfiguredError extends Error {
  constructor(name) {
    super(`${name} contract address is not configured. Set it in the environment.`);
    this.name = 'ContractNotConfiguredError';
    this.statusCode = 503;
  }
}

class BaseContractService {
  constructor({ name, address, abi }) {
    this.name = name;
    this.address = address;
    this.abi = abi;
  }

  assertConfigured() {
    if (!config.isAddressConfigured(this.address)) {
      throw new ContractNotConfiguredError(this.name);
    }
  }

  getReadContract() {
    this.assertConfigured();
    return getContract(this.address, this.abi, false);
  }

  getWriteContract() {
    this.assertConfigured();
    return getContract(this.address, this.abi, true);
  }

  /**
   * Build an unsigned tx the frontend can send via MetaMask.
   * @param {string} method
   * @param {any[]} args
   * @param {{ from?: string, value?: string }} overrides  value in wei as string
   */
  async prepareTransaction(method, args = [], overrides = {}) {
    this.assertConfigured();
    const contract = this.getReadContract();
    const data = contract.interface.encodeFunctionData(method, args);

    const tx = {
      to: this.address,
      data,
      chainId: config.chainId,
      from: overrides.from || undefined,
    };

    if (overrides.value) {
      tx.value = ethers.BigNumber.from(overrides.value).toHexString();
    }

    // Estimate gas when we have a from address (improves UX)
    if (overrides.from) {
      try {
        const provider = getProvider();
        const gas = await provider.estimateGas({
          to: tx.to,
          data: tx.data,
          from: overrides.from,
          value: tx.value || 0,
        });
        tx.gasLimit = gas.toHexString();
      } catch {
        // Estimation can fail if contracts aren't deployed yet — still return payload
      }
    }

    return {
      contract: this.name,
      method,
      args,
      transaction: tx,
      network: {
        chainId: config.chainId,
        name: config.name,
      },
    };
  }
}

module.exports = {
  BaseContractService,
  ContractNotConfiguredError,
};
