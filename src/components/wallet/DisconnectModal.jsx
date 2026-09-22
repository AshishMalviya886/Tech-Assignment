import { FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Confirmation modal before disconnecting wallet
 */
function DisconnectModal({ isOpen, onConfirm, onCancel, address }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative max-w-md w-full bg-white dark:bg-[#24292e] rounded-lg shadow-2xl border-2 border-yellow-200 dark:border-yellow-800 p-6"
            >
              {/* Content */}
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-4">
                  <FiAlertTriangle className="text-yellow-500" size={48} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                  Disconnect Wallet?
                </h3>

                {/* Message */}
                <p className="text-secondary-600 dark:text-secondary-300 mb-2">
                  Are you sure you want to disconnect your wallet?
                </p>
                
                {address && (
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-6 font-mono bg-secondary-100 dark:bg-secondary-800 px-3 py-1 rounded">
                    {address}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 w-full">
                  <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border-2 border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-200 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default DisconnectModal;
