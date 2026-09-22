import { useState } from 'react';
import { FaWallet } from 'react-icons/fa';
import { useWallet } from '../../context/WalletContext';
import DisconnectModal from './DisconnectModal';

/**
 * Reusable wallet connect / disconnect control.
 * Use variant="hero" for the home CTA, default matches primary navbar button.
 */
function ConnectWalletButton({
  className = 'btn',
  variant = 'default',
  showIcon = true,
  connectedLabel,
}) {
  const {
    isConnected,
    shortAddress,
    connecting,
    connectWallet,
    disconnectWallet,
    error,
  } = useWallet();

  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const label = isConnected
    ? connectedLabel || shortAddress
    : connecting
      ? 'Connecting…'
      : 'Connect Wallet';

  const handleClick = async () => {
    if (isConnected) {
      // Show confirmation before disconnect
      setShowDisconnectModal(true);
      return;
    }
    await connectWallet();
  };

  const handleConfirmDisconnect = () => {
    setShowDisconnectModal(false);
    disconnectWallet();
  };

  const baseClass =
    variant === 'hero'
      ? `btn bg-primary-700 hover:bg-primary-800 ${className}`
      : className;

  return (
    <>
      <div className="inline-flex flex-col items-stretch">
        <button
          type="button"
          className={baseClass}
          onClick={handleClick}
          disabled={connecting}
          title={isConnected ? 'Click to disconnect' : 'Connect MetaMask or compatible wallet'}
        >
          {showIcon && <FaWallet className="mr-2" />}
          {label}
        </button>
        {error && (
          <span className="mt-1 text-xs text-red-500 max-w-[220px]">{error}</span>
        )}
      </div>

      <DisconnectModal
        isOpen={showDisconnectModal}
        onConfirm={handleConfirmDisconnect}
        onCancel={() => setShowDisconnectModal(false)}
        address={shortAddress}
      />
    </>
  );
}

export default ConnectWalletButton;
