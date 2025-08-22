// components/projects/wizard/project/DisclaimerModal.jsx
import React from 'react';
import { X, ExternalLink, Flag } from 'lucide-react';

const DisclaimerModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleReportClick = () => {
    // Close the modal and open the report page/form
    onClose();
    // You can navigate to a report page or open another modal here
    window.open('/report', '_blank');
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Content Disclaimer
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
              This application is an independent tool for tabletop gaming enthusiasts and is not affiliated with, endorsed by, or connected to any game manufacturers, miniature companies, or their parent companies.
            </p>

            <p className="text-sm leading-relaxed">
              All manufacturer names, game names, faction names, unit names, and character names are trademarks of their respective owners and are used here solely for identification and reference purposes by users to organize their hobby projects.
            </p>

            <p className="text-sm leading-relaxed">
              <strong>All information is user-generated content.</strong> We rely on our community to maintain accurate and appropriate content. We respect all intellectual property rights and use this information only to help hobbyists organize their miniature painting projects.
            </p>

            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Found something unsuitable or have copyright concerns?</strong><br />
                Please report any content that you believe is inappropriate, inaccurate, or violates intellectual property rights.
              </p>
            </div>
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

              <button
                onClick={handleReportClick}
                className="btn-outline-primary btn-sm flex-1 flex items-center justify-center gap-2"
              >
                <Flag size={14} />
                Report Content
              </button>

              <a
                href="/legal/disclaimer"
                className="btn-outline-primary btn-sm flex-1 flex items-center justify-center gap-2"
                onClick={onClose}
              >
                <ExternalLink size={14} />
                Full Legal Notice
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;