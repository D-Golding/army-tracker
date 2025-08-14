// components/shared/PaintDisclaimerModal.jsx
import React from 'react';
import { X, ExternalLink } from 'lucide-react';

const PaintDisclaimerModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Paint Reference Disclaimer
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="text-sm leading-relaxed">
              This application is an independent tool for tabletop gaming enthusiasts and is not affiliated with, endorsed by, or connected to any paint manufacturers or their parent companies.
            </p>

            <p className="text-sm leading-relaxed">
              All paint names, product names, and brand names are trademarks of their respective owners and are used here solely for identification and reference purposes.
            </p>

            <p className="text-sm leading-relaxed">
              We respect all intellectual property rights and use this information only to help hobbyists organise their paint collections.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="btn-tertiary btn-sm flex-1"
              >
                Close
              </button>

                <a href="/legal/disclaimer"
                className="btn-outline-primary btn-sm flex-1 flex items-center justify-center gap-2"
                onClick={onClose}
              >
                <ExternalLink size={14} />
                View Full Legal Notice
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaintDisclaimerModal;