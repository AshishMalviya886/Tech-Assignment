const RealEstateAbi = require('../abis/RealEstate.json');
const config = require('../config');
const { BaseContractService } = require('./BaseContractService');

class RealEstateService extends BaseContractService {
  constructor() {
    super({
      name: 'RealEstate',
      address: config.contracts.realEstate,
      abi: RealEstateAbi,
    });
  }

  async getTotalSupply() {
    const contract = this.getReadContract();
    const supply = await contract.totalSupply();
    return supply.toString();
  }

  async getToken(tokenId) {
    const contract = this.getReadContract();
    const [tokenURI, owner] = await Promise.all([
      contract.tokenURI(tokenId),
      contract.ownerOf(tokenId),
    ]);
    return {
      tokenId: String(tokenId),
      tokenURI,
      owner,
    };
  }

  /**
   * Returns unsigned mint tx for the connected wallet to sign.
   */
  prepareMint(tokenURI, from) {
    return this.prepareTransaction('mint', [tokenURI], { from });
  }
}

module.exports = new RealEstateService();
