// components/projects/AddProjectButton.jsx - Add Project Button with Subscription Limits
import React from 'react';
import { Plus } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';

const AddProjectButton = ({ onClick, isLoading = false, showUpgradeModal }) => {
  const { canPerformAction, currentTier } = useSubscription();

  // Check if user can add projects
  const canAddProjects = canPerformAction('add_project', 1);
  const isTopTier = currentTier === 'battle';

  // Button should ONLY be disabled if: can't add projects AND is top tier OR is loading
  const isDisabled = (!canAddProjects && isTopTier) || isLoading;

  // Button text based on state
  const getButtonText = () => {
    if (isLoading) return 'Adding...';
    if (!canAddProjects && isTopTier) return 'Project limit reached';
    if (!canAddProjects) return 'Upgrade for more projects';
    return 'Add New Project';
  };

  // Handle click - show upgrade modal if at limit but not top tier
  const handleClick = () => {
    if (isLoading) return;

    if (canAddProjects) {
      onClick();
    } else if (!isTopTier && showUpgradeModal) {
      showUpgradeModal('projects');
    }
    // If top tier and at limit, button is disabled so nothing happens
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`w-full mb-4 p-4 gradient-secondary text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-98 disabled:opacity-50 ${
        isDisabled ? 'cursor-not-allowed' : ''
      }`}
    >
      <Plus className="inline-block mr-2" size={20} />
      {getButtonText()}
    </button>
  );
};

export default AddProjectButton;