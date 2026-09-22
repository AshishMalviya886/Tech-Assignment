/**
 * HTTP adapters for blockchain services.
 * Controllers stay thin: validate input → call service → shape response.
 */
const { ethers } = require('ethers');
const {
  config,
  getProvider,
  realEstateService,
  escrowService,
} = require('../blockchain');
const { ContractNotConfiguredError } = require('../blockchain/services/BaseContractService');

function handleError(res, err) {
  const status =
    err.statusCode ||
    (err instanceof ContractNotConfiguredError ? 503 : 500);
  const message = err.reason || err.message || 'Blockchain request failed';
  console.error('[blockchain]', message);
  return res.status(status).json({
    success: false,
    error: message,
  });
}

function assertAddress(value, fieldName) {
  if (!value || !ethers.utils.isAddress(value)) {
    const err = new Error(`Invalid or missing ${fieldName}`);
    err.statusCode = 400;
    throw err;
  }
}

exports.getHealth = async (_req, res) => {
  try {
    const provider = getProvider();
    let blockNumber = null;
    let rpcReachable = false;

    try {
      blockNumber = await Promise.race([
        provider.getBlockNumber(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('RPC timeout')), 2500)
        ),
      ]);
      rpcReachable = true;
    } catch {
      rpcReachable = false;
    }

    return res.json({
      success: true,
      data: {
        network: config.network,
        chainId: config.chainId,
        name: config.name,
        rpcReachable,
        blockNumber,
        contracts: {
          realEstate: {
            address: config.contracts.realEstate,
            configured: config.isAddressConfigured(config.contracts.realEstate),
          },
          escrow: {
            address: config.contracts.escrow,
            configured: config.isAddressConfigured(config.contracts.escrow),
          },
        },
        serverSignerConfigured: Boolean(config.privateKey),
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
};

exports.getConfig = async (_req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        network: config.network,
        chainId: config.chainId,
        name: config.name,
        contracts: config.contracts,
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
};

exports.getRealEstateSupply = async (_req, res) => {
  try {
    const totalSupply = await realEstateService.getTotalSupply();
    return res.json({ success: true, data: { totalSupply } });
  } catch (err) {
    return handleError(res, err);
  }
};

exports.getToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    if (tokenId === undefined || Number.isNaN(Number(tokenId))) {
      return res.status(400).json({ success: false, error: 'Invalid tokenId' });
    }
    const token = await realEstateService.getToken(tokenId);
    return res.json({ success: true, data: token });
  } catch (err) {
    return handleError(res, err);
  }
};

exports.prepareMint = async (req, res) => {
  try {
    const { tokenURI, from } = req.body || {};
    if (!tokenURI || typeof tokenURI !== 'string') {
      return res.status(400).json({ success: false, error: 'tokenURI is required' });
    }
    if (from) assertAddress(from, 'from');

    const payload = await realEstateService.prepareMint(tokenURI, from);
    return res.json({ success: true, data: payload });
  } catch (err) {
    return handleError(res, err);
  }
};

exports.getEscrowBalance = async (_req, res) => {
  try {
    const balance = await escrowService.getBalance();
    return res.json({ success: true, data: balance });
  } catch (err) {
    return handleError(res, err);
  }
};

exports.getEscrowListing = async (req, res) => {
  try {
    const { nftId } = req.params;
    if (nftId === undefined || Number.isNaN(Number(nftId))) {
      return res.status(400).json({ success: false, error: 'Invalid nftId' });
    }
    const listing = await escrowService.getListing(nftId);
    return res.json({ success: true, data: listing });
  } catch (err) {
    return handleError(res, err);
  }
};

exports.getEscrowRoles = async (_req, res) => {
  try {
    const roles = await escrowService.getRoles();
    return res.json({ success: true, data: roles });
  } catch (err) {
    return handleError(res, err);
  }
};

exports.prepareEscrowAction = async (req, res) => {
  try {
    const { action } = req.params;
    const body = req.body || {};

    if (body.from) assertAddress(body.from, 'from');
    if (body.buyer) assertAddress(body.buyer, 'buyer');
    if (body.nftId === undefined) {
      return res.status(400).json({ success: false, error: 'nftId is required' });
    }

    const payload = await escrowService.prepareAction(action, body);
    return res.json({ success: true, data: payload });
  } catch (err) {
    return handleError(res, err);
  }
};
