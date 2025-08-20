// components/paints/PaintList/components/PaintGrid.jsx
import React from 'react';
import { useInView } from 'react-intersection-observer';
import { MoreHorizontal } from 'lucide-react';
import PaintCard from '../paintCard.jsx';
import AddPaintForm from '../AddPaintForm';

const PaintGrid = ({
  // Data
  paints,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  responsivePageSize,

  // Add form
  showAddForm,
  hasReachedPaintLimit,
  onAddPaint,
  onCancelAdd,
  isOperationLoading,

  // Bulk delete
  bulkDeleteMode,
  selectedPaints,
  onToggleSelection,

  // Paint operations
  onRefill,
  onReducePaint,
  onMoveToCollection,
  onMoveToWishlist,
  onMoveToListed,
  onDelete,
  onProjectsUpdated,

  // Pagination
  onFetchNextPage
}) => {
  // Intersection observer for auto-loading
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '800px', // Load when user is 800px from the bottom
  });

  // Auto-load more paints when the load more element comes into view
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      onFetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, onFetchNextPage]);

  // Handle load more button click (manual fallback)
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      onFetchNextPage();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="paint-grid-container">
        <div className="paint-grid-loading">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="paint-grid-loading-item">
              <div className="paint-grid-loading-content">
                <div className="paint-grid-loading-title"></div>
                <div className="paint-grid-loading-subtitle"></div>
                <div className="paint-grid-loading-bar"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Add Paint Form */}
      {showAddForm && !hasReachedPaintLimit && (
        <div className="paint-actions-container">
          <AddPaintForm
            onAddPaint={onAddPaint}
            loading={isOperationLoading}
            onCancel={onCancelAdd}
          />
        </div>
      )}

      {/* Paint Cards Grid */}
      <div className="paint-grid-container">
        <div className="paint-grid">
          {paints.map((paint) => (
            <div key={paint.id} className="paint-card">
              <PaintCard
                paint={paint}
                onRefill={onRefill}
                onReducePaint={onReducePaint}
                onMoveToCollection={onMoveToCollection}
                onMoveToWishlist={onMoveToWishlist}
                onMoveToListed={onMoveToListed}
                onDelete={onDelete}
                onProjectsUpdated={onProjectsUpdated}
                disabled={isOperationLoading}
                // Bulk delete props
                bulkDeleteMode={bulkDeleteMode}
                isSelected={selectedPaints.has(paint.name)}
                onToggleSelection={() => onToggleSelection(paint.name)}
              />
            </div>
          ))}

          {/* Load More Section */}
          <div className="text-center py-6">
            {hasNextPage ? (
              <div className="space-y-4">
                {/* Invisible trigger element for auto-loading */}
                <div ref={loadMoreRef} className="h-1" />

                <button
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  className="btn-secondary btn-md"
                >
                  {isFetchingNextPage ? (
                    <>
                      <div className="loading-spinner mr-2"></div>
                      Loading More Paints...
                    </>
                  ) : (
                    <>
                      <MoreHorizontal className="inline-block mr-2" size={20} />
                      Load More Paints
                    </>
                  )}
                </button>

                {/* Loading indicator for next page */}
                {isFetchingNextPage && (
                  <div className="paint-grid">
                    {[...Array(Math.min(responsivePageSize, 8))].map((_, index) => (
                      <div key={index} className="paint-grid-loading-item">
                        <div className="paint-grid-loading-content">
                          <div className="paint-grid-loading-title"></div>
                          <div className="paint-grid-loading-subtitle"></div>
                          <div className="paint-grid-loading-bar"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                  You've seen all your paints
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">
                  Add more paints to expand your collection!
                </p>
              </div>
            )}
          </div>

          {/* Empty States */}
          {paints.length === 0 && (
            <div className="paint-grid-empty">
              No paints found. Add your first paint to get started!
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaintGrid;