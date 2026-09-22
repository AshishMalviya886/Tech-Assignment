/**
 * Thin client for the smart-contract backend API.
 * Centralizes base URL so the frontend stays decoupled from Express routing.
 */
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3099';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const blockchainApi = {
  getHealth: () => request('/api/blockchain/health'),
  getConfig: () => request('/api/blockchain/config'),
  getRealEstateSupply: () => request('/api/blockchain/real-estate/supply'),
  getToken: (tokenId) => request(`/api/blockchain/real-estate/tokens/${tokenId}`),
  prepareMint: (tokenURI, from) =>
    request('/api/blockchain/real-estate/prepare-mint', {
      method: 'POST',
      body: JSON.stringify({ tokenURI, from }),
    }),
  getEscrowListing: (nftId) => request(`/api/blockchain/escrow/listings/${nftId}`),
  getEscrowBalance: () => request('/api/blockchain/escrow/balance'),
  prepareEscrowAction: (action, payload) =>
    request(`/api/blockchain/escrow/prepare/${action}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export default blockchainApi;
