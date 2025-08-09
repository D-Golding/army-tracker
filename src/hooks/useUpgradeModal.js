// hooks/useUpgradeModal.js
import { useState } from 'react';
import { useSubscription } from './useSubscription';

export const useUpgradeModal = () => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState({
    limitType: null,
    customTitle: null,
    customMessage: null
  });

  const { currentTier } = useSubscription();

  // Show upgrade modal with specific limit context
  const showUpgradeModal = (limitType, customTitle = null, customMessage = null) => {
    setUpgradeModalData({
      limitType,
      customTitle,
      customMessage
    });
    setIsUpgradeModalOpen(true);
  };

  // Hide upgrade modal
  const hideUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setUpgradeModalData({
      limitType: null,
      customTitle: null,
      customMessage: null
    });
  };

  // Modal props ready to spread
  const upgradeModalProps = {
    isOpen: isUpgradeModalOpen,
    onClose: hideUpgradeModal,
    currentTier,
    limitType: upgradeModalData.limitType,
    customTitle: upgradeModalData.customTitle,
    customMessage: upgradeModalData.customMessage
  };

  return {
    showUpgradeModal,
    hideUpgradeModal,
    upgradeModalProps,
    isUpgradeModalOpen
  };
};