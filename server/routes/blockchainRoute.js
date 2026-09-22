const express = require('express');
const blockchainController = require('../controllers/blockchainController');

const router = express.Router();

/**
 * Blockchain / smart-contract API
 *
 * GET  /health                         – RPC + contract readiness
 * GET  /config                         – public chain + addresses
 * GET  /real-estate/supply             – ERC-721 totalSupply
 * GET  /real-estate/tokens/:tokenId    – tokenURI + owner
 * POST /real-estate/prepare-mint       – unsigned mint tx for wallet
 * GET  /escrow/balance                 – escrow ETH balance
 * GET  /escrow/roles                   – seller / inspector / lender
 * GET  /escrow/listings/:nftId         – listing snapshot
 * POST /escrow/prepare/:action         – unsigned escrow tx
 *        actions: list | depositEarnest | updateInspectionStatus |
 *                 approveSale | finalizeSale | cancelSale
 */
router.get('/health', blockchainController.getHealth);
router.get('/config', blockchainController.getConfig);

router.get('/real-estate/supply', blockchainController.getRealEstateSupply);
router.get('/real-estate/tokens/:tokenId', blockchainController.getToken);
router.post('/real-estate/prepare-mint', blockchainController.prepareMint);

router.get('/escrow/balance', blockchainController.getEscrowBalance);
router.get('/escrow/roles', blockchainController.getEscrowRoles);
router.get('/escrow/listings/:nftId', blockchainController.getEscrowListing);
router.post('/escrow/prepare/:action', blockchainController.prepareEscrowAction);

module.exports = router;
