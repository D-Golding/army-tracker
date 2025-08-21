// components/PaintCatalogBrowser.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Check, Plus, Info } from 'lucide-react';
import {
  getCatalogBrands,
  getCatalogTypesByBrand,
  getCatalogPaintsByBrandAndType
} from '../../services/paintCatalogService';
import PaintDisclaimerModal from '../shared/PaintDisclaimerModal';

const PaintCatalogBrowser = ({ onAddPaints, onBack }) => {
  const [step, setStep] = useState('brands'); // 'brands', 'types', 'paints'
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Data states
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
  const [paints, setPaints] = useState([]);

  // Selection states - now includes status for each paint
  const [selectedPaints, setSelectedPaints] = useState(new Map()); // Map of paintId -> status
  const [colorFilter, setColorFilter] = useState('');

  // Load brands on component mount
  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const brandData = await getCatalogBrands();
      setBrands(brandData);
    } catch (error) {
      console.error('Error loading brands:', error);
    }
    setLoading(false);
  };

  const loadTypes = async (brand) => {
    setLoading(true);
    try {
      const typeData = await getCatalogTypesByBrand(brand);
      setTypes(typeData);
    } catch (error) {
      console.error('Error loading types:', error);
    }
    setLoading(false);
  };

  const loadPaints = async (brand, type) => {
    setLoading(true);
    try {
      const paintData = await getCatalogPaintsByBrandAndType(brand, type);
      setPaints(paintData);
      setSelectedPaints(new Map()); // Reset selections
    } catch (error) {
      console.error('Error loading paints:', error);
    }
    setLoading(false);
  };

  const handleBrandSelect = async (brand) => {
    setSelectedBrand(brand);
    setStep('types');
    await loadTypes(brand);
  };

  const handleTypeSelect = async (type) => {
    setSelectedType(type);
    setStep('paints');
    await loadPaints(selectedBrand, type);
  };

  const handlePaintToggle = (paintId) => {
    const newSelected = new Map(selectedPaints);
    if (newSelected.has(paintId)) {
      newSelected.delete(paintId);
    } else {
      newSelected.set(paintId, 'collection'); // Default to collection
    }
    setSelectedPaints(newSelected);
  };

  const handleStatusChange = (paintId, status) => {
    const newSelected = new Map(selectedPaints);
    newSelected.set(paintId, status);
    setSelectedPaints(newSelected);
  };

  const handleSelectAll = (status = 'collection') => {
    const filteredPaints = getFilteredPaints();
    const newSelected = new Map(selectedPaints);

    filteredPaints.forEach(paint => {
      newSelected.set(paint.id, status);
    });

    setSelectedPaints(newSelected);
  };

  const handleDeselectAll = () => {
    const filteredPaints = getFilteredPaints();
    const newSelected = new Map(selectedPaints);

    filteredPaints.forEach(paint => {
      newSelected.delete(paint.id);
    });

    setSelectedPaints(newSelected);
  };

  const getFilteredPaints = () => {
    if (!colorFilter) return paints;
    return paints.filter(paint =>
      paint.name.toLowerCase().includes(colorFilter.toLowerCase()) ||
      (paint.colour && paint.colour.toLowerCase().includes(colorFilter.toLowerCase()))
    );
  };

  const getSelectedFilteredCount = () => {
    const filteredPaints = getFilteredPaints();
    return filteredPaints.filter(paint => selectedPaints.has(paint.id)).length;
  };

  const handleAddSelected = () => {
    const paintsToAdd = paints
      .filter(paint => selectedPaints.has(paint.id))
      .map(paint => {
        const status = selectedPaints.get(paint.id);
        return {
          brand: paint.brand,
          airbrush: paint.airbrush,
          type: paint.type,
          name: paint.name,
          colour: paint.colour,
          status: status,
          level: status === 'collection' ? 100 : 0,
          sprayPaint: paint.sprayPaint
        };
      });

    onAddPaints(paintsToAdd);
  };

  const goBack = () => {
    if (step === 'paints') {
      setStep('types');
      setPaints([]);
      setSelectedPaints(new Map());
      setColorFilter('');
    } else if (step === 'types') {
      setStep('brands');
      setTypes([]);
      setSelectedBrand('');
    } else {
      onBack();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="loading-spinner-primary mx-auto mb-4"></div>
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={goBack}
          className="btn-icon text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white">
            {step === 'brands' && 'Select Brand'}
            {step === 'types' && `Select Type - ${selectedBrand}`}
            {step === 'paints' && `${selectedBrand} ${selectedType}`}
          </h4>
          {step === 'paints' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedPaints.size} of {getFilteredPaints().length} selected
            </p>
          )}
        </div>
        <button
          onClick={() => setShowDisclaimer(true)}
          className="flex items-center gap-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Paint reference disclaimer"
        >
          <Info size={16} className="w-4 h-4 border border-current rounded-full" />
          <span className="text-sm">Disclaimer</span>
        </button>
      </div>

      {/* Brand Selection */}
      {step === 'brands' && (
        <div className="space-y-2">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => handleBrandSelect(brand)}
              className="catalog-item"
            >
              <div className="font-medium text-gray-900 dark:text-white">{brand}</div>
            </button>
          ))}
          {brands.length === 0 && (
            <div className="empty-state">
              No paint brands found in catalogue.
            </div>
          )}
        </div>
      )}

      {/* Type Selection */}
      {step === 'types' && (
        <div className="space-y-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeSelect(type)}
              className="catalog-item"
            >
              <div className="font-medium text-gray-900 dark:text-white">{type}</div>
            </button>
          ))}
          {types.length === 0 && (
            <div className="empty-state">
              No paint types found for {selectedBrand}.
            </div>
          )}
        </div>
      )}

      {/* Paint Selection */}
      {step === 'paints' && (
        <div className="space-y-4">
          {/* Color Filter */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Filter by color or paint name..."
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              className="form-input-with-icon"
            />
          </div>

          {/* Bulk Action Buttons */}
          {getFilteredPaints().length > 0 && (
            <div className="space-y-2">
              {/* Select All Options */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSelectAll('collection')}
                  className="btn-secondary btn-sm text-xs"
                >
                  <Plus size={12} />
                  All to Collection
                </button>
                <button
                  onClick={() => handleSelectAll('wishlist')}
                  className="btn-sm text-xs gradient-danger text-white hover:shadow-lg disabled:opacity-50 btn-base"
                >
                  <Plus size={12} />
                  All to Wishlist
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSelectAll('listed')}
                  className="btn-tertiary btn-sm text-xs"
                >
                  <Plus size={12} />
                  All as Listed
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="btn-outline btn-sm text-xs"
                >
                  Deselect All{colorFilter && ' Filtered'}
                </button>
              </div>
            </div>
          )}

          {/* Paint List */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {getFilteredPaints().map((paint) => (
              <div
                key={paint.id}
                className={selectedPaints.has(paint.id)
                  ? 'paint-selection-item-selected'
                  : 'paint-selection-item-unselected'
                }
              >
                <div className="flex items-start gap-3">
                  {/* Selection Checkbox */}
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer mt-1 ${
                      selectedPaints.has(paint.id)
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    onClick={() => handlePaintToggle(paint.id)}
                  >
                    {selectedPaints.has(paint.id) && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    {/* Paint Info */}
                    <div className="font-medium text-gray-900 dark:text-white">
                      {paint.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {paint.brand} • {paint.type}
                      {paint.colour && ` • ${paint.colour}`}
                      {paint.airbrush && ' • Airbrush'}
                      {paint.sprayPaint && ' • Spray'}
                    </div>

                    {/* Status Selection - Only show if paint is selected */}
                    {selectedPaints.has(paint.id) && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Add to:
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                              type="radio"
                              name={`status-${paint.id}`}
                              value="collection"
                              checked={selectedPaints.get(paint.id) === 'collection'}
                              onChange={(e) => handleStatusChange(paint.id, e.target.value)}
                              className="w-4 h-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Collection (I own this)</span>
                          </label>

                          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                              type="radio"
                              name={`status-${paint.id}`}
                              value="wishlist"
                              checked={selectedPaints.get(paint.id) === 'wishlist'}
                              onChange={(e) => handleStatusChange(paint.id, e.target.value)}
                              className="w-4 h-4 border-gray-300 text-pink-600 focus:ring-pink-500"
                            />
                            <span>Wishlist</span>
                          </label>

                          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                              type="radio"
                              name={`status-${paint.id}`}
                              value="listed"
                              checked={selectedPaints.get(paint.id) === 'listed'}
                              onChange={(e) => handleStatusChange(paint.id, e.target.value)}
                              className="form-radio"
                            />
                            <span>Listed (reference only)</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {getFilteredPaints().length === 0 && (
            <div className="empty-state">
              {colorFilter ? `No paints found matching "${colorFilter}"` : 'No paints found in this category.'}
            </div>
          )}

          {/* Add Selected Button */}
          {selectedPaints.size > 0 && (
            <button
              onClick={handleAddSelected}
              className="btn-primary btn-md w-full"
            >
              <Plus size={16} />
              Add {selectedPaints.size} Selected Paint{selectedPaints.size !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Paint Disclaimer Modal */}
      <PaintDisclaimerModal
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
      />
    </div>
  );
};

export default PaintCatalogBrowser;