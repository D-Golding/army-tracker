// components/projects/PaintOverview.jsx - Updated with inline paint selection
import React, { useState, useMemo } from 'react';
import { Palette, Plus, Trash2, MoreVertical, Eye, Info, Search, Check, X } from 'lucide-react';
import { usePaints } from '../../hooks/usePaints';
import { useSubscription } from '../../hooks/useSubscription';

const PaintOverview = ({
  projectData,
  onPaintsAdded,
  onPaintRemoved,
  className = ''
}) => {
  const [showDropdown, setShowDropdown] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaints, setSelectedPaints] = useState([]);
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAdding, setIsAdding] = useState(false);

  const { canPerformAction, getUpgradeMessage, getRemainingAllowance, currentTier } = useSubscription();
  const { data: allPaints = [], isLoading: isPaintsLoading } = usePaints('all');

  const paintOverview = projectData?.paintOverview || [];
  const existingPaintIds = paintOverview.map(paint => paint.paintId);

  // Filter paints that aren't already in the project
  const availablePaints = useMemo(() => {
    return allPaints.filter(paint => !existingPaintIds.includes(paint.id));
  }, [allPaints, existingPaintIds]);

  // Get unique brands and types for filtering
  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(availablePaints.map(paint => paint.brand))];
    return uniqueBrands.sort();
  }, [availablePaints]);

  const types = useMemo(() => {
    const uniqueTypes = [...new Set(availablePaints.map(paint => paint.type))];
    return uniqueTypes.sort();
  }, [availablePaints]);

  // Filter paints based on search and filters
  const filteredPaints = useMemo(() => {
    return availablePaints.filter(paint => {
      const matchesSearch = paint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           paint.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = filterBrand === 'all' || paint.brand === filterBrand;
      const matchesType = filterType === 'all' || paint.type === filterType;
      const matchesStatus = filterStatus === 'all' || paint.status === filterStatus;

      return matchesSearch && matchesBrand && matchesType && matchesStatus;
    });
  }, [availablePaints, searchTerm, filterBrand, filterType, filterStatus]);

  // Handle paint selection for batch add
  const togglePaintSelection = (paint) => {
    setSelectedPaints(prev => {
      const isSelected = prev.find(p => p.id === paint.id);
      if (isSelected) {
        return prev.filter(p => p.id !== paint.id);
      } else {
        return [...prev, paint];
      }
    });
  };

  // Handle adding selected paints to project
  const handleAddSelectedPaints = async () => {
    if (selectedPaints.length === 0) return;

    // Check paint assignment limits
    if (!canPerformAction('add_paint_assignment', selectedPaints.length, projectData)) {
      alert(getUpgradeMessage('paintAssignments'));
      return;
    }

    setIsAdding(true);

    try {
      // Transform paints to project paint format
      const paintsToAdd = selectedPaints.map(paint => ({
        paintId: paint.id,
        paintName: paint.name,
        brand: paint.brand,
        type: paint.type,
        status: paint.status,
        addedToProject: new Date().toISOString(),
        totalUsageSteps: 0
      }));

      await onPaintsAdded(paintsToAdd);

      // Reset form state
      setSelectedPaints([]);
      setSearchTerm('');
      setFilterBrand('all');
      setFilterType('all');
      setFilterStatus('all');
      setShowAddForm(false);

    } catch (error) {
      console.error('Error adding paints to project:', error);
      alert('Failed to add paints to project. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  // Handle cancel adding
  const handleCancelAdd = () => {
    setSelectedPaints([]);
    setSearchTerm('');
    setFilterBrand('all');
    setFilterType('all');
    setFilterStatus('all');
    setShowAddForm(false);
  };

  // Handle add paint button click
  const handleAddPaintClick = () => {
    if (!canPerformAction('add_paint_assignment', 1, projectData)) {
      alert(getUpgradeMessage('paintAssignments'));
      return;
    }
    setShowAddForm(true);
  };

  // Handle removing paint from project
  const handleRemovePaint = async (paintId) => {
    if (onPaintRemoved) {
      await onPaintRemoved(paintId);
    }
    setShowDeleteConfirm(null);
  };

  // Close dropdowns when clicking outside
  const handleBackdropClick = () => {
    setShowDropdown(null);
  };

  // Get usage information for a paint
  const getPaintUsageInfo = (paint) => {
    const stepsUsingPaint = projectData?.steps?.filter(step =>
      step.paints?.some(stepPaint => stepPaint.paintId === paint.paintId)
    ) || [];

    return {
      stepCount: stepsUsingPaint.length,
      steps: stepsUsingPaint
    };
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const badges = {
      collection: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      wishlist: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      listed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return badges[status] || badges.listed;
  };

  const getStatusLabel = (status) => {
    const labels = {
      collection: 'Owned',
      wishlist: 'Wishlist',
      listed: 'Reference'
    };
    return labels[status] || status;
  };

  const remainingSlots = getRemainingAllowance('paintAssignments', true, projectData);

  // Button logic
  const canAddPaints = canPerformAction('add_paint_assignment', 1, projectData);
  const isTopTier = currentTier === 'battle';
  const paintButtonDisabled = !canAddPaints && isTopTier;

  // Get paints to display (show 1 initially, all when expanded)
  const displayPaints = isExpanded ? paintOverview : paintOverview.slice(0, 1);
  const hasMorePaints = paintOverview.length > 1;

  return (
    <>
      <div className={`card-base card-padding ${className}`}>

        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Palette className="mr-2" size={18} />
              Paint Overview ({paintOverview.length})
            </h2>
          </div>

          {/* Add Paints Button - On separate line, left aligned */}
          {!showAddForm && (
            <div className="flex justify-start mt-3">
              <button
                onClick={handleAddPaintClick}
                disabled={paintButtonDisabled}
                className={`btn-primary btn-sm ${paintButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Plus size={14} />
                {canAddPaints ? "Add Paints" : (isTopTier ? "Add Paints" : "Upgrade")}
              </button>
            </div>
          )}
        </div>

        {/* Usage Info */}
        {remainingSlots !== null && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {remainingSlots > 0 ? (
                <span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {remainingSlots}
                  </span> paint assignment{remainingSlots !== 1 ? 's' : ''} remaining
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Paint assignment limit reached
                </span>
              )}
            </div>
          </div>
        )}

        {/* Inline Add Form */}
        {showAddForm && (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Add Paints to Project
              </h4>
              <button
                onClick={handleCancelAdd}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-3 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search paints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                  disabled={isPaintsLoading}
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="form-select text-sm"
                  disabled={isPaintsLoading}
                >
                  <option value="all">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="form-select text-sm"
                  disabled={isPaintsLoading}
                >
                  <option value="all">All Types</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-select text-sm"
                  disabled={isPaintsLoading}
                >
                  <option value="all">All Sources</option>
                  <option value="collection">My Collection</option>
                  <option value="wishlist">Wishlist</option>
                  <option value="listed">Reference</option>
                </select>
              </div>
            </div>

            {/* Selected Paints Summary */}
            {selectedPaints.length > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    {selectedPaints.length} paint{selectedPaints.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setSelectedPaints([])}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}

            {/* Paint List */}
            <div className="max-h-64 overflow-y-auto mb-4">
              {isPaintsLoading ? (
                <div className="text-center py-4">
                  <div className="loading-spinner-primary mx-auto mb-2"></div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Loading paints...</div>
                </div>
              ) : filteredPaints.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  {availablePaints.length === 0 ? (
                    <div>
                      <Palette className="mx-auto mb-2 text-gray-400" size={24} />
                      <p className="text-sm">No paints available to add</p>
                      <p className="text-xs mt-1">All paints from your inventory are already in this project</p>
                    </div>
                  ) : (
                    <div>
                      <Search className="mx-auto mb-2 text-gray-400" size={24} />
                      <p className="text-sm">No paints found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPaints.map(paint => {
                    const isSelected = selectedPaints.find(p => p.id === paint.id);

                    return (
                      <div
                        key={paint.id}
                        onClick={() => togglePaintSelection(paint)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium text-gray-900 dark:text-white text-sm">
                                {paint.name}
                              </div>
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusBadge(paint.status)}`}>
                                {getStatusLabel(paint.status)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {paint.brand} • {paint.type}
                              {paint.level !== undefined && paint.status === 'collection' && (
                                <span className="ml-2">• {paint.level}% remaining</span>
                              )}
                              {paint.colour && (
                                <span className="ml-2">• {paint.colour}</span>
                              )}
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'border-indigo-500 bg-indigo-500' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isSelected && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelAdd}
                disabled={isAdding}
                className="btn-tertiary btn-sm flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSelectedPaints}
                disabled={selectedPaints.length === 0 || isAdding}
                className="btn-primary btn-sm flex-1"
              >
                {isAdding ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    Add {selectedPaints.length} Paint{selectedPaints.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* No Paints State */}
        {paintOverview.length === 0 && !showAddForm ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Palette className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="mb-3">No paints added to this project</p>
          </div>
        ) : (
          <>
            {/* Paint List */}
            <div className="space-y-3 mb-4">
              {displayPaints.map((paint) => {
                const usageInfo = getPaintUsageInfo(paint);

                return (
                  <div key={paint.paintId} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">

                    {/* Main Paint Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {paint.paintName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {paint.brand} • {paint.type}
                        </div>

                        {/* Usage Summary */}
                        <div className="mt-2">
                          {usageInfo.stepCount > 0 ? (
                            <div className="text-sm text-indigo-600 dark:text-indigo-400">
                              <Info size={12} className="inline mr-1" />
                              Used in {usageInfo.stepCount} step{usageInfo.stepCount !== 1 ? 's' : ''}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <Info size={12} className="inline mr-1" />
                              Not yet assigned to any steps
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-2">
                          <button
                            onClick={() => setShowDeleteConfirm(paint.paintId)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Mobile Menu */}
                        <div className="relative md:hidden">
                          <button
                            onClick={() => setShowDropdown(showDropdown === paint.paintId ? null : paint.paintId)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {showDropdown === paint.paintId && (
                            <>
                              <div className="dropdown-backdrop" onClick={handleBackdropClick}></div>
                              <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-[9999] w-40">
                                <button
                                  onClick={() => {
                                    setShowDeleteConfirm(paint.paintId);
                                    setShowDropdown(null);
                                  }}
                                  className="dropdown-item-danger"
                                >
                                  <Trash2 size={14} />
                                  Remove Paint
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Step Usage Details (if used) */}
                    {usageInfo.stepCount > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Used in:</div>
                        <div className="flex flex-wrap gap-1">
                          {usageInfo.steps.map((step, index) => (
                            <span
                              key={step.id}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-lg"
                            >
                              {step.title || `Step ${step.order || index + 1}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* See All / Show Less Button */}
            {hasMorePaints && !showAddForm && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
              >
                {isExpanded ? (
                  <>Show Less</>
                ) : (
                  <>See All ({paintOverview.length - 1} more)</>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Remove Paint?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will remove the paint from your project overview. Any step assignments using this paint will also be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-tertiary btn-md flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemovePaint(showDeleteConfirm)}
                className="btn-danger btn-md flex-1"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaintOverview;