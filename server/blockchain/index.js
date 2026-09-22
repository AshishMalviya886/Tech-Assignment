const config = require('./config');
const { getProvider } = require('./provider');
const realEstateService = require('./services/realEstateService');
const escrowService = require('./services/escrowService');

module.exports = {
  config,
  getProvider,
  realEstateService,
  escrowService,
};
