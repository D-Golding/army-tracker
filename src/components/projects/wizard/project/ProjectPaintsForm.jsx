// components/projects/wizard/ProjectPaintsForm.jsx - Paint selection form step
import React, { useState, useMemo } from 'react';
import { Palette, Plus, X, Search, Check } from 'lucide-react';
import { usePaints } from '../../../../hooks/usePaints';
import { useSubscription } from '../../../../hooks/useSubscription';

const ProjectPaintsForm = ({
  formData,
  onPaintsAdded,
  onPaintRemoved,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPaints, setSelectedPaints] = useState([]);

  // Get paints from user's inventory
  const { data: allPaints = [], isLoading: isPaintsLoading } = usePaints('all');
  const { canPerformAction, getRemainingAllowance } = useSubscription();

  // Filter paints that aren't already selected
  const availablePaints = useMemo(() => {
    const selectedIds = formData.selectedPaints.map(p => p.id);
    return allPaints.filter(paint => !selectedIds.includes(paint.id));
  }, [allPaints, formData.selectedPaints]);

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

  // Add selected paints to project
  const handleAddSelectedPaints = () => {
    if (selectedPaints.length === 0) return;

    // Check limits
    if (!canPerformAction('add_paint_assignment', selectedPaints.length)) {
      alert('Paint assignment limit reached. Upgrade your plan to add more paints.');
      return;
    }

    onPaintsAdded(selectedPaints);
    setSelectedPaints([]);

    // Clear search and filters after adding
    setSearchTerm('');
    setFilterBrand('all');
    setFilterType('all');
    setFilterStatus('all');
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

  const remainingAssignments = getRemainingAllowance('paintAssignments', false);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Palette className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Paint Selection
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add paints from your inventory to this project (optional)
        </p>
      </div>

      {/* Usage Info */}
      {remainingAssignments !== null && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {remainingAssignments > 0 ? (
              <span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {remainingAssignments}
                </span> paint assignment{remainingAssignments !== 1 ? 's' : ''} remaining
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Paint assignment limit reached
              </span>
            )}
          </div>
        </div>
      )}

      {/* Selected Paints Display */}
      {formData.selectedPaints.length > 0 && (
        <div className="space-y-3 mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Selected Paints ({formData.selectedPaints.length})
          </h4>
          <div className="space-y-2">
            {formData.selectedPaints.map((paint) => (
              <div
                key={paint.id}
                className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {paint.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {paint.brand} • {paint.type}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusBadge(paint.status)}`}>
                    {getStatusLabel(paint.status)}
                  </span>
                </div>
                <button
                  onClick={() => onPaintRemoved(paint.id)}
                  disabled={isLoading}
                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  title="Remove paint"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paint Browser */}
      {availablePaints.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Add More Paints
          </h4>

          {/* Search and Filters */}
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search paints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
                disabled={isLoading}
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-3 gap-3">
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="form-select text-sm"
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  {selectedPaints.length} paint{selectedPaints.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPaints([])}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleAddSelectedPaints}
                    disabled={isLoading}
                    className="btn-primary btn-sm"
                  >
                    <Plus size={12} />
                    Add Selected
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Paint List */}
          <div className="max-h-64 overflow-y-auto">
            {isPaintsLoading ? (
              <div className="text-center py-8">
                <div className="loading-spinner-primary mx-auto mb-4"></div>
                <div className="text-gray-600 dark:text-gray-400">Loading paints...</div>
              </div>
            ) : filteredPaints.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Palette className="mx-auto mb-3 text-gray-400" size={24} />
                <p className="text-sm">No paints found</p>
                <p className="text-xs mt-1">Try adjusting your search or filters</p>
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
        </div>
      )}

      {/* No Paints Available */}
      {availablePaints.length === 0 && formData.selectedPaints.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Palette className="mx-auto mb-3 text-gray-400" size={32} />
          <p className="mb-3">No paints in your inventory</p>
          <p className="text-sm">Add paints to your collection, wishlist, or reference list first</p>
        </div>
      )}

      {/* Skip Option */}
      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You can always add paints to your project later
        </p>
      </div>
    </div>
  );
};

export default ProjectPaintsForm;