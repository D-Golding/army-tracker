// components/paints/PaintList/index.jsx
import React from 'react';
import { usePaintListState } from '../../hooks/paints/usePaintListState.js';
import { usePaintListFilters } from '../../hooks/paints/usePaintListFilters';
import { usePaintOperations } from '../../hooks/usePaints';
import { getAllPaints } from '../../services/paints/index.js';
import PaintListHeader from '../paints/PaintList/PaintListHeader';
import BulkDeleteControls from '../paints/PaintList/BulkDeleteControls.jsx';
import PaintGrid from '../paints/PaintList/PaintGrid';
import PaintListModals from '../paints/PaintList/PaintListModals';
import BackToTopButton from '../paints/PaintList/BackToTopButton';

const PaintList = () => {
  // Filters
  const {
    activeFilters,
    getFilteredPaints,
    handleFiltersChange,
    handleSummaryFilterClick,
  } = usePaintListFilters();

  // State and data
  const {
    // Data
    paints,
    summary,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,

    // Calculated values
    totalPaintsCount,
    hasReachedPaintLimit,
    currentTier,
    paintLimit,
    responsivePageSize,

    // UI state
    showAddForm,
    setShowAddForm,
    showDisclaimer,
    setShowDisclaimer,
    showUpgradeModal,
    setShowUpgradeModal,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showBackToTop,

    // Bulk delete
    bulkDeleteMode,
    selectedPaints,
    toggleBulkDeleteMode,
    togglePaintSelection,
    selectAllFilteredPaints,
    deselectAllPaints,

    // Actions
    scrollToTop,
  } = usePaintListState(activeFilters);

  // Paint operations
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

  // Apply filters to paints
  const filteredPaints = getFilteredPaints(paints);

  // Action handlers
  const handleAddPaintClick = () => {
    if (hasReachedPaintLimit) {
      setShowUpgradeModal(true);
    } else {
      setShowAddForm(!showAddForm);
    }
  };

  const handleAddPaint = async (paintData) => {
    try {
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

      await addPaint(dataToSend);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding paint:', error);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      const deletePromises = Array.from(selectedPaints).map(paintName =>
        deletePaint(paintName)
      );

      await Promise.all(deletePromises);
      setSelectedPaints(new Set());
      setBulkDeleteMode(false);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting paints:', error);
      setShowDeleteConfirm(false);
    }
  };

  const handleSelectAll = () => {
    selectAllFilteredPaints(filteredPaints);
  };

  // Paint operation handlers
  const handleRefill = async (paintName) => {
    try {
      await refillPaint(paintName);
    } catch (error) {
      console.error('Error refilling paint:', error);
    }
  };

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

  const handleDelete = async (paintName) => {
    try {
      await deletePaint(paintName);
    } catch (error) {
      console.error('Error deleting paint:', error);
    }
  };

  const handleProjectsUpdated = async (paintName, projectIds) => {
    try {
      await updatePaintProjects({ paintName, projectIds });
    } catch (error) {
      console.error('Error updating paint projects:', error);
    }
  };

  // Error state
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
      <PaintListHeader
        summary={summary}
        totalPaintsCount={totalPaintsCount}
        paintLimit={paintLimit}
        hasReachedPaintLimit={hasReachedPaintLimit}
        currentTier={currentTier}
        showAddForm={showAddForm}
        bulkDeleteMode={bulkDeleteMode}
        filteredPaintsCount={filteredPaints.length}
        onFilterClick={handleSummaryFilterClick}
        onAddPaintClick={handleAddPaintClick}
        onToggleBulkDelete={toggleBulkDeleteMode}
        isOperationLoading={isOperationLoading}
        // New props for search/filters
        activeFilters={activeFilters}
        onFiltersChange={handleFiltersChange}
        onShowDisclaimer={() => setShowDisclaimer(true)}
      />

      {bulkDeleteMode && (
        <BulkDeleteControls
          selectedPaintsCount={selectedPaints.size}
          filteredPaintsCount={filteredPaints.length}
          totalPaintsCount={totalPaintsCount}
          activeFilters={activeFilters}
          onSelectAll={handleSelectAll}
          onDeselectAll={deselectAllPaints}
          onConfirmDelete={() => setShowDeleteConfirm(true)}
          isOperationLoading={isOperationLoading}
        />
      )}

      <PaintGrid
        paints={filteredPaints}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        responsivePageSize={responsivePageSize}
        showAddForm={showAddForm}
        hasReachedPaintLimit={hasReachedPaintLimit}
        onAddPaint={handleAddPaint}
        onCancelAdd={() => setShowAddForm(false)}
        isOperationLoading={isOperationLoading}
        bulkDeleteMode={bulkDeleteMode}
        selectedPaints={selectedPaints}
        onToggleSelection={togglePaintSelection}
        onRefill={handleRefill}
        onReducePaint={handleReducePaint}
        onMoveToCollection={handleMoveToCollection}
        onMoveToWishlist={handleMoveToWishlist}
        onMoveToListed={handleMoveToListed}
        onDelete={handleDelete}
        onProjectsUpdated={handleProjectsUpdated}
        onFetchNextPage={fetchNextPage}
      />

      <PaintListModals
        showDisclaimer={showDisclaimer}
        onCloseDisclaimer={() => setShowDisclaimer(false)}
        showDeleteConfirm={showDeleteConfirm}
        onCloseDeleteConfirm={() => setShowDeleteConfirm(false)}
        selectedPaintsCount={selectedPaints.size}
        onConfirmDelete={handleBulkDeleteConfirm}
        isOperationLoading={isOperationLoading}
        showUpgradeModal={showUpgradeModal}
        onCloseUpgradeModal={() => setShowUpgradeModal(false)}
        currentTier={currentTier}
        paintLimit={paintLimit}
      />

      <BackToTopButton onClick={scrollToTop} show={showBackToTop} />
    </div>
  );
};

export default PaintList;