import { useEffect } from 'react';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal component for wallet connection status, errors, and success messages
 * Types: 'info' | 'success' | 'error' | 'connecting'
 */
function WalletModal({ isOpen, onClose, type = 'info', title, message, showCloseButton = true }) {
  // Auto-close success messages after 3 seconds
  useEffect(() => {
    if (isOpen && type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, type, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-green-500" size={48} />;
      case 'error':
        return <FiAlertCircle className="text-red-500" size={48} />;
      case 'connecting':
        return (
          <div className="relative">
            <motion.div
              className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        );
      default:
        return <FiInfo className="text-primary-600" size={48} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 dark:border-green-800';
      case 'error':
        return 'border-red-200 dark:border-red-800';
      case 'connecting':
        return 'border-primary-200 dark:border-primary-800';
      default:
        return 'border-secondary-200 dark:border-secondary-700';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className={`
                relative max-w-md w-full bg-white dark:bg-[#24292e] rounded-lg shadow-2xl
                border-2 ${getColors()}
                p-6
              `}
            >
              {/* Close button */}
              {showCloseButton && type !== 'connecting' && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200 transition-colors"
                  aria-label="Close"
                >
                  <FiX size={24} />
                </button>
              )}

              {/* Content */}
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-4">
                  {getIcon()}
                </div>

                {/* Title */}
                {title && (
                  <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                    {title}
                  </h3>
                )}

                {/* Message */}
                {message && (
                  <p className="text-secondary-600 dark:text-secondary-300 mb-6">
                    {message}
                  </p>
                )}

                {/* Action buttons for error/info */}
                {type === 'error' && showCloseButton && (
                  <button
                    onClick={onClose}
                    className="btn bg-red-600 hover:bg-red-700 text-white px-6 py-2"
                  >
                    Close
                  </button>
                )}

                {/* Connecting state message */}
                {type === 'connecting' && (
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-2">
                    Please check your wallet extension
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default WalletModal;
