// components/projects/AddPaintToProjectModal.jsx
import React, { useState, useMemo } from 'react';
import { X, Search, Palette, Plus, Check } from 'lucide-react';
import { usePaints } from '../../hooks/usePaints';
import { useSubscription } from '../../hooks/useSubscription';

const AddPaintToProjectModal = ({
  isOpen,
  onClose,
  onPaintsAdded,
  projectData,
  existingPaintIds = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaints, setSelectedPaints] = useState([]);
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isAdding, setIsAdding] = useState(false);

  // Get user's paint collection
  const { data: allPaints = [], isLoading } = usePaints('collection');
  const { canPerformAction, getUpgradeMessage } = useSubscription();

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

      return matchesSearch && matchesBrand && matchesType;
    });
  }, [availablePaints, searchTerm, filterBrand, filterType]);

  // Handle paint selection
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
  const handleAddPaints = async () => {
    if (selectedPaints.length === 0) return;

    // Check paint assignment limits
    const currentAssignments = existingPaintIds.length;
    const newTotal = currentAssignments + selectedPaints.length;

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
        addedToProject: new Date().toISOString(),
        totalUsageSteps: 0
      }));

      await onPaintsAdded(paintsToAdd);

      // Reset state and close
      setSelectedPaints([]);
      setSearchTerm('');
      setFilterBrand('all');
      setFilterType('all');
      onClose();

    } catch (error) {
      console.error('Error adding paints to project:', error);
      alert('Failed to add paints to project. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    setSelectedPaints([]);
    setSearchTerm('');
    setFilterBrand('all');
    setFilterType('all');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Paints to Project
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-4 flex-shrink-0">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search paints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3">
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="form-select"
            >
              <option value="all">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-select"
            >
              <option value="all">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Paints Summary */}
        {selectedPaints.length > 0 && (
          <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3 mb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                {selectedPaints.length} paint{selectedPaints.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedPaints([])}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Paint List - Scrollable */}
        <div className="flex-1 overflow-y-auto mb-4 min-h-0">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="loading-spinner-primary mx-auto mb-4"></div>
              <div className="text-gray-600 dark:text-gray-400">Loading paints...</div>
            </div>
          ) : filteredPaints.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {availablePaints.length === 0 ? (
                <div>
                  <Palette className="mx-auto mb-3 text-gray-400" size={32} />
                  <p>No paints in your collection</p>
                  <p className="text-sm mt-1">Add paints to your inventory first</p>
                </div>
              ) : (
                <div>
                  <Search className="mx-auto mb-3 text-gray-400" size={32} />
                  <p>No paints found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
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
                        <div className="font-medium text-gray-900 dark:text-white">
                          {paint.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {paint.brand} • {paint.type}
                          {paint.level !== undefined && (
                            <span className="ml-2">• {paint.level}% remaining</span>
                          )}
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && (
                          <Check size={14} className="text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions - Always Visible */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={handleClose}
            disabled={isAdding}
            className="btn-tertiary btn-md flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleAddPaints}
            disabled={selectedPaints.length === 0 || isAdding}
            className="btn-primary btn-md flex-1"
          >
            {isAdding ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add {selectedPaints.length} Paint{selectedPaints.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPaintToProjectModal;