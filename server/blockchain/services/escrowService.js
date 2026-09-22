const { ethers } = require('ethers');
const EscrowAbi = require('../abis/Escrow.json');
const config = require('../config');
const { BaseContractService } = require('./BaseContractService');

const PREPARE_ACTIONS = new Set([
  'list',
  'depositEarnest',
  'updateInspectionStatus',
  'approveSale',
  'finalizeSale',
  'cancelSale',
]);

class EscrowService extends BaseContractService {
  constructor() {
    super({
      name: 'Escrow',
      address: config.contracts.escrow,
      abi: EscrowAbi,
    });
  }

  async getBalance() {
    const contract = this.getReadContract();
    const balance = await contract.getBalance();
    return {
      wei: balance.toString(),
      eth: ethers.utils.formatEther(balance),
    };
  }

  async getListing(nftId) {
    const contract = this.getReadContract();
    const id = ethers.BigNumber.from(nftId);

    const [isListed, purchasePrice, escrowAmount, buyer, inspectionPassed] =
      await Promise.all([
        contract.isListed(id),
        contract.purchasePrice(id),
        contract.escrowAmount(id),
        contract.buyer(id),
        contract.inspectionPassed(id),
      ]);

    return {
      nftId: String(nftId),
      isListed,
      purchasePrice: {
        wei: purchasePrice.toString(),
        eth: ethers.utils.formatEther(purchasePrice),
      },
      escrowAmount: {
        wei: escrowAmount.toString(),
        eth: ethers.utils.formatEther(escrowAmount),
      },
      buyer,
      inspectionPassed,
    };
  }

  async getRoles() {
    const contract = this.getReadContract();
    const [nftAddress, seller, inspector, lender] = await Promise.all([
      contract.nftAddress(),
      contract.seller(),
      contract.inspector(),
      contract.lender(),
    ]);
    return { nftAddress, seller, inspector, lender };
  }

  /**
   * Map a high-level escrow action to an unsigned transaction payload.
   * Keeps controller thin and makes it easy to add new actions later.
   */
  prepareAction(action, body = {}) {
    if (!PREPARE_ACTIONS.has(action)) {
      const err = new Error(`Unsupported escrow action: ${action}`);
      err.statusCode = 400;
      throw err;
    }

    const from = body.from;
    const nftId = body.nftId;

    switch (action) {
      case 'list':
        return this.prepareTransaction(
          'list',
          [nftId, body.buyer, body.purchasePrice, body.escrowAmount],
          { from }
        );
      case 'depositEarnest':
        return this.prepareTransaction('depositEarnest', [nftId], {
          from,
          value: body.value,
        });
      case 'updateInspectionStatus':
        return this.prepareTransaction(
          'updateInspectionStatus',
          [nftId, Boolean(body.passed)],
          { from }
        );
      case 'approveSale':
        return this.prepareTransaction('approveSale', [nftId], { from });
      case 'finalizeSale':
        return this.prepareTransaction('finalizeSale', [nftId], { from });
      case 'cancelSale':
        return this.prepareTransaction('cancelSale', [nftId], { from });
      default:
        throw new Error(`Unhandled action: ${action}`);
    }
  }
}

module.exports = new EscrowService();
module.exports.PREPARE_ACTIONS = PREPARE_ACTIONS;
