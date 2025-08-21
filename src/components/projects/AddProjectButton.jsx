// components/projects/AddProjectButton.jsx - Updated to match paint button styling
import React from 'react';
import { Plus, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';

const AddProjectButton = ({ isLoading = false, showUpgradeModal }) => {
  const navigate = useNavigate();
  const { canPerformAction, currentTier, usage, limits } = useSubscription();

  // Check if user can add projects
  const canAddProjects = canPerformAction('add_project', 1);
  const isTopTier = currentTier === 'battle';
  const hasReachedProjectLimit = usage.projects >= limits.projects;

  // Handle button click
  const handleClick = () => {
    if (isLoading) return;

    if (hasReachedProjectLimit) {
      if (showUpgradeModal && !isTopTier) {
        showUpgradeModal('projects');
      }
    } else {
      navigate('/app/projects/new');
    }
  };

  return (
    <div className="summary-cards-container">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="btn-md flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transition-all mb-4 w-full"
      >
        {hasReachedProjectLimit ? (
          <>
            <Zap className="inline-block mr-2" size={20} />
            Upgrade to add more ({usage.projects}/{limits.projects})
          </>
        ) : (
          <>
            <Plus className="inline-block mr-2" size={20} />
            Add New Project ({usage.projects}/{limits.projects})
          </>
        )}
      </button>
    </div>
  );
};

export default AddProjectButton;