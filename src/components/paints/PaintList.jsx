// components/PaintList.jsx - Updated with simplified bulk delete
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Info, Trash2, X, ChevronUp, Zap } from 'lucide-react';
import PaintCard from './PaintCard';
import SummaryCards from './SummaryCards';
import AddPaintForm from './AddPaintForm';
import PaintSearchFilter from '../paints/PaintSearchFilter';
import PaintDisclaimerModal from '../shared/PaintDisclaimerModal';
import ConfirmationModal from '../common/ConfirmationModal';
import UpgradeModal from '../shared/UpgradeModal';
import { usePaintListData, usePaintOperations } from '../../hooks/usePaints.js';
import { filterPaints, getFilterSummary } from '../../utils/paintFilterUtils.js';
import { useAuth } from '../../contexts/AuthContext.jsx';

const PaintList = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Bulk delete states
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [selectedPaints, setSelectedPaints] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Back to top state
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Get auth context for tier information
  const { userProfile } = useAuth();

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      // Show back to top button when scrolled more than 400px
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Get all paint data via React Query hooks
  const { paints: allPaints, summary, isLoading, isError, error } = usePaintListData('all');
  const {
    addPaint,
    deletePaint,
    refillPaint,
    reducePaint,
    moveToCollection,
    moveToWishlist,
    moveToListed,
    updatePaintProjects,
    isLoading: isOperationLoading
  } = usePaintOperations();

  // Check if user has reached paint limit
  const paintLimit = userProfile?.limits?.paints || 25;
  const currentTier = userProfile?.subscription?.tier || 'free';
  const hasReachedPaintLimit = allPaints.length >= paintLimit;

  // Handle add paint button click
  const handleAddPaintClick = () => {
    if (hasReachedPaintLimit) {
      setShowUpgradeModal(true);
    } else {
      setShowAddForm(!showAddForm);
    }
  };
  const filteredPaints = useMemo(() => {
    return filterPaints(allPaints, activeFilters);
  }, [allPaints, activeFilters]);

  // Handle filter changes from the search component
  const handleFiltersChange = useCallback((filters) => {
    setActiveFilters(filters);
  }, []);

  // Handle filter clicks from summary cards
  const handleSummaryFilterClick = (filterType) => {
    let newFilters = { ...activeFilters };

    newFilters.basicFilter = newFilters.basicFilter === filterType ? 'all' : filterType;

    setActiveFilters(newFilters);
  };

  // Bulk delete functions
  const toggleBulkDeleteMode = () => {
    setBulkDeleteMode(!bulkDeleteMode);
    setSelectedPaints(new Set());
  };

  const togglePaintSelection = (paintName) => {
    const newSelected = new Set(selectedPaints);
    if (newSelected.has(paintName)) {
      newSelected.delete(paintName);
    } else {
      newSelected.add(paintName);
    }
    setSelectedPaints(newSelected);
  };

  const selectAllFilteredPaints = () => {
    const allFilteredNames = new Set(filteredPaints.map(paint => paint.name));
    setSelectedPaints(allFilteredNames);
  };

  const deselectAllPaints = () => {
    setSelectedPaints(new Set());
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      // Delete all selected paints
      const deletePromises = Array.from(selectedPaints).map(paintName =>
        deletePaint(paintName)
      );

      await Promise.all(deletePromises);

      // Reset selection and exit bulk mode
      setSelectedPaints(new Set());
      setBulkDeleteMode(false);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting paints:', error);
      setShowDeleteConfirm(false);
    }
  };

  // Handle adding new paint with proper async/await
  const handleAddPaint = async (paintData) => {
    try {
      console.log('PaintList.handleAddPaint - received paintData:', paintData);

      const dataToSend = {
        brand: paintData.brand,
        airbrush: paintData.airbrush,
        type: paintData.type,
        name: paintData.name,
        colour: paintData.colour,
        status: paintData.status,
        level: paintData.level,
        photoURL: null,
        sprayPaint: paintData.sprayPaint
      };

      console.log('PaintList.handleAddPaint - sending to addPaint:', dataToSend);

      await addPaint(dataToSend);
      setShowAddForm(false);

    } catch (error) {
      console.error('Error adding paint:', error);
    }
  };

  // Handle paint operations with proper async/await
  const handleReducePaint = async (paintName) => {
    try {
      await reducePaint(paintName);
    } catch (error) {
      console.error('Error reducing paint level:', error);
    }
  };

  const handleMoveToCollection = async (paintName) => {
    try {
      await moveToCollection(paintName);
    } catch (error) {
      console.error('Error moving to collection:', error);
    }
  };

  const handleMoveToWishlist = async (paintName) => {
    try {
      await moveToWishlist(paintName);
    } catch (error) {
      console.error('Error moving to wishlist:', error);
    }
  };

  const handleMoveToListed = async (paintName) => {
    try {
      await moveToListed(paintName);
    } catch (error) {
      console.error('Error moving to listed:', error);
    }
  };

  const handleRefill = async (paintName) => {
    try {
      await refillPaint(paintName);
    } catch (error) {
      console.error('Error refilling paint:', error);
    }
  };

  const handleDelete = async (paintName) => {
    try {
      await deletePaint(paintName);
    } catch (error) {
      console.error('Error deleting paint:', error);
    }
  };

  // Handle paint project updates
  const handleProjectsUpdated = async (paintName, projectIds) => {
    try {
      await updatePaintProjects({ paintName, projectIds });
    } catch (error) {
      console.error('Error updating paint projects:', error);
    }
  };

  // Show error state
  if (isError) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 dark:text-red-400 mb-4">
          Error loading paints: {error?.message || 'Unknown error'}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary btn-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Cards - Now clickable for quick filtering */}
      <SummaryCards
        summary={summary}
        onFilterClick={handleSummaryFilterClick}
      />

      {/* Action Buttons Row */}
      <div className="flex gap-3 mb-4">
        {/* Add Paint Button - Changes based on limit */}
        <button
          onClick={handleAddPaintClick}
          disabled={isOperationLoading}
          className="btn-md flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transition-all"
        >
          {hasReachedPaintLimit ? (
            <>
              <Zap className="inline-block mr-2" size={20} />
              Upgrade to add more ({allPaints.length}/{paintLimit})
            </>
          ) : showAddForm ? (
            <>
              <X className="inline-block mr-2" size={20} />
              Cancel
            </>
          ) : (
            <>
              <Plus className="inline-block mr-2" size={20} />
              Add New Paint ({allPaints.length}/{paintLimit})
            </>
          )}
        </button>

        {/* Delete Multiple Button */}
        {bulkDeleteMode ? (
          <button
            onClick={toggleBulkDeleteMode}
            className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            title="Cancel selection"
          >
            <X size={20} />
          </button>
        ) : (
          <button
            onClick={toggleBulkDeleteMode}
            disabled={isOperationLoading || filteredPaints.length === 0}
            className="p-3 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
            title="Delete multiple paints"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* Selection Controls - Sticky */}
      {bulkDeleteMode && (
        <div className="sticky top-4 z-40 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              {selectedPaints.size} paint{selectedPaints.size !== 1 ? 's' : ''} selected
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={selectAllFilteredPaints}
              disabled={filteredPaints.length === 0}
              className="btn-sm btn-secondary"
            >
              Select All {filteredPaints.length > 0 && `(${filteredPaints.length})`}
            </button>

            <button
              onClick={deselectAllPaints}
              disabled={selectedPaints.size === 0}
              className="btn-sm btn-tertiary"
            >
              Deselect All
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={selectedPaints.size === 0 || isOperationLoading}
              className="btn-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              <Trash2 className="inline-block mr-1" size={14} />
              Delete Selected ({selectedPaints.size})
            </button>
          </div>
        </div>
      )}

      {/* Add Paint Form - Only show if not at limit */}
      {showAddForm && !hasReachedPaintLimit && (
        <AddPaintForm
          onAddPaint={handleAddPaint}
          loading={isOperationLoading}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Integrated Search and Filter Component */}
      <PaintSearchFilter
        onFiltersChange={handleFiltersChange}
        initialFilters={activeFilters}
      />

      {/* Filter Results Summary */}
      {allPaints.length > 0 && (
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {getFilterSummary(activeFilters, filteredPaints.length, allPaints.length)}
          </div>
          <button
            onClick={() => setShowDisclaimer(true)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Paint reference disclaimer"
          >
            <Info size={16} className="w-4 h-4 border border-current rounded-full" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="loading-spinner-primary mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400">Loading paints...</div>
        </div>
      ) : (
        <>
          {/* Paint Cards */}
          <div className="space-y-4">
            {filteredPaints.map((paint) => (
              <PaintCard
                key={paint.id}
                paint={paint}
                onRefill={handleRefill}
                onReducePaint={handleReducePaint}
                onMoveToCollection={handleMoveToCollection}
                onMoveToWishlist={handleMoveToWishlist}
                onMoveToListed={handleMoveToListed}
                onDelete={handleDelete}
                onProjectsUpdated={handleProjectsUpdated}
                disabled={isOperationLoading}
                // Bulk delete props
                bulkDeleteMode={bulkDeleteMode}
                isSelected={selectedPaints.has(paint.name)}
                onToggleSelection={() => togglePaintSelection(paint.name)}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredPaints.length === 0 && allPaints.length > 0 && (
            <div className="empty-state">
              No paints match your current filters. Try adjusting your search criteria.
            </div>
          )}

          {/* No paints at all */}
          {allPaints.length === 0 && (
            <div className="empty-state">
              No paints found. Add your first paint to get started!
            </div>
            )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Paints?"
        message={`This will permanently delete ${selectedPaints.size} paint${selectedPaints.size !== 1 ? 's' : ''} from your collection. This action cannot be undone.`}
        type="error"
        primaryAction={{
          label: "Delete",
          onClick: handleBulkDeleteConfirm,
          variant: "danger",
          disabled: isOperationLoading
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setShowDeleteConfirm(false)
        }}
      />

      {/* Paint Disclaimer Modal */}
      <PaintDisclaimerModal
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={currentTier}
        limitType="paints"
        customTitle="Paint Collection Limit Reached"
        customMessage={`You've reached your limit of ${paintLimit} paints on the ${currentTier} tier. Upgrade to track more paints and unlock additional features.`}
      />

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 z-50 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ease-out transform hover:scale-105"
          title="Back to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
};

export default PaintList;