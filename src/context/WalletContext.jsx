import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import WalletModal from '../components/wallet/WalletModal';

const WalletContext = createContext(null);

const SHORT_ADDRESS_LENGTH = 4;

export function shortenAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 2 + SHORT_ADDRESS_LENGTH)}…${address.slice(-SHORT_ADDRESS_LENGTH)}`;
}

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);
  
  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const isMetaMaskAvailable = typeof window !== 'undefined' && Boolean(window.ethereum);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, type: 'info', title: '', message: '' });
  }, []);

  const showModal = useCallback((type, title, message) => {
    setModalState({ isOpen: true, type, title, message });
  }, []);

  const syncFromProvider = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();
      setAccount(accounts[0] || null);
      setChainId(network.chainId);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to sync wallet');
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      const errorMsg = 'No Ethereum wallet found. Please install MetaMask.';
      setError(errorMsg);
      showModal('error', 'Wallet Not Found', errorMsg);
      return null;
    }

    setConnecting(true);
    setError(null);
    
    // Show connecting modal
    showModal('connecting', 'Connecting Wallet', 'Please approve the connection in your wallet extension...');

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setAccount(address);
      setChainId(network.chainId);
      
      // Show success modal
      showModal(
        'success',
        'Connected Successfully!',
        `Wallet connected: ${shortenAddress(address)}`
      );
      
      return address;
    } catch (err) {
      const message =
        err.code === 4001
          ? 'Connection request was rejected. Please try again.'
          : err.message || 'Failed to connect wallet. Please try again.';
      
      setError(message);
      
      // Show error modal
      showModal('error', 'Connection Failed', message);
      
      return null;
    } finally {
      setConnecting(false);
    }
  }, [showModal]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setError(null);
    
    // Show disconnect confirmation modal
    showModal(
      'info',
      'Wallet Disconnected',
      'Your wallet has been disconnected successfully.'
    );
  }, [showModal]);

  useEffect(() => {
    if (!window.ethereum) return undefined;

    syncFromProvider();

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || null);
    };

    const handleChainChanged = (hexChainId) => {
      setChainId(parseInt(hexChainId, 16));
    };

    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [syncFromProvider]);

  const value = useMemo(
    () => ({
      account,
      chainId,
      error,
      connecting,
      isConnected: Boolean(account),
      isMetaMaskAvailable,
      shortAddress: shortenAddress(account),
      connectWallet,
      disconnectWallet,
      showModal,
      closeModal,
    }),
    [
      account,
      chainId,
      error,
      connecting,
      isMetaMaskAvailable,
      connectWallet,
      disconnectWallet,
      showModal,
      closeModal,
    ]
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
      <WalletModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onClose={closeModal}
        showCloseButton={modalState.type !== 'connecting'}
      />
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return ctx;
}
