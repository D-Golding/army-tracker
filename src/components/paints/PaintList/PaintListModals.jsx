// components/paints/PaintList/components/PaintListModals.jsx
import React from 'react';
import PaintDisclaimerModal from '../../shared/PaintDisclaimerModal';
import ConfirmationModal from '../../common/ConfirmationModal';
import UpgradeModal from '../../shared/UpgradeModal';

const PaintListModals = ({
  // Disclaimer modal
  showDisclaimer,
  onCloseDisclaimer,

  // Delete confirmation modal
  showDeleteConfirm,
  onCloseDeleteConfirm,
  selectedPaintsCount,
  onConfirmDelete,
  isOperationLoading,

  // Upgrade modal
  showUpgradeModal,
  onCloseUpgradeModal,
  currentTier,
  paintLimit
}) => {
  return (
    <>
      {/* Paint Disclaimer Modal */}
      <PaintDisclaimerModal
        isOpen={showDisclaimer}
        onClose={onCloseDisclaimer}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={onCloseDeleteConfirm}
        title="Delete Paints?"
        message={`This will permanently delete ${selectedPaintsCount} paint${selectedPaintsCount !== 1 ? 's' : ''} from your collection. This action cannot be undone.`}
        type="error"
        primaryAction={{
          label: "Delete",
          onClick: onConfirmDelete,
          variant: "danger",
          disabled: isOperationLoading
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: onCloseDeleteConfirm
        }}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={onCloseUpgradeModal}
        currentTier={currentTier}
        limitType="paints"
        customTitle="Paint Collection Limit Reached"
        customMessage={`You've reached your limit of ${paintLimit} paints on the ${currentTier} tier. Upgrade to track more paints and unlock additional features.`}
      />
    </>
  );
};

export default PaintListModals;