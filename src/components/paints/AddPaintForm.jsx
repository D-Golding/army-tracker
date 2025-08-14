// components/AddPaintForm.jsx
import React, { useState, useEffect } from 'react';
import { X, List, Edit, Info } from 'lucide-react';
import {
  getAllPaints,
  getAllProjects,
  findPaintName
} from '../../services/paints/index.js';
import PaintCatalogBrowser from './PaintCatalogBrowser.jsx';
import PaintDisclaimerModal from '../shared/PaintDisclaimerModal.jsx';

const AddPaintForm = ({ onAddPaint, loading, onCancel }) => {
  const [mode, setMode] = useState('choose'); // 'choose', 'list', 'manual'
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    brand: '',
    customBrand: '',
    type: '',
    customType: '',
    name: '',
    colour: '',
    status: 'listed',
    airbrush: false,
    sprayPaint: false,
    selectedProjects: []
  });

  // Load data when component mounts
  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      // Get all paints to extract unique brands and types
      const [allPaints, allProjects] = await Promise.all([
        getAllPaints(),
        getAllProjects()
      ]);

      // Extract unique brands and types, sort alphabetically
      const uniqueBrands = [...new Set(allPaints.map(paint => paint.brand))].sort();
      const uniqueTypes = [...new Set(allPaints.map(paint => paint.type))].sort();

      setBrands(uniqueBrands);
      setTypes(uniqueTypes);
      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  // Check for duplicates when name or brand changes
  useEffect(() => {
    if (mode === 'manual') {
      checkForDuplicates();
    }
  }, [formData.name, formData.brand, formData.customBrand, mode]);

  const checkForDuplicates = async () => {
    if (!formData.name) {
      setDuplicateWarning('');
      return;
    }

    const finalBrand = formData.brand === 'custom' ? formData.customBrand : formData.brand;
    if (!finalBrand) {
      setDuplicateWarning('');
      return;
    }

    try {
      const allPaints = await getAllPaints();
      const duplicate = allPaints.find(paint =>
        paint.name.toLowerCase() === formData.name.toLowerCase() &&
        paint.brand.toLowerCase() === finalBrand.toLowerCase()
      );

      if (duplicate) {
        setDuplicateWarning(`A paint named "${formData.name}" by "${finalBrand}" already exists.`);
      } else {
        setDuplicateWarning('');
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
    }
  };

  const handleProjectToggle = (projectId) => {
    setFormData(prev => ({
      ...prev,
      selectedProjects: prev.selectedProjects.includes(projectId)
        ? prev.selectedProjects.filter(id => id !== projectId)
        : [...prev.selectedProjects, projectId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalBrand = formData.brand === 'custom' ? formData.customBrand : formData.brand;
    const finalType = formData.type === 'custom' ? formData.customType : formData.type;
    const level = formData.status === 'collection' ? 100 : 0;

    await onAddPaint({
      brand: finalBrand,
      type: finalType,
      name: formData.name,
      colour: formData.colour,
      status: formData.status,
      level,
      airbrush: formData.airbrush,
      sprayPaint: formData.sprayPaint,
      projects: formData.selectedProjects
    });

    // Reset form
    setFormData({
      brand: '',
      customBrand: '',
      type: '',
      customType: '',
      name: '',
      colour: '',
      status: 'listed',
      airbrush: false,
      sprayPaint: false,
      selectedProjects: []
    });
    setDuplicateWarning('');
    setMode('choose');
  };

  // Handle adding paints from catalog
  const handleAddFromCatalog = async (catalogPaints) => {
    try {
      for (const catalogPaint of catalogPaints) {
        // Check if paint already exists in user's collection
        const existing = await findPaintName(catalogPaint.name);

        if (!existing) {
          // Use the status from the catalog paint (collection, wishlist, or listed)
          const level = catalogPaint.status === 'collection' ? 100 : 0;

          const paintData = {
            brand: catalogPaint.brand,
            type: catalogPaint.type,
            name: catalogPaint.name,
            colour: catalogPaint.colour,
            status: catalogPaint.status,
            level: level,
            airbrush: catalogPaint.airbrush || false,
            sprayPaint: catalogPaint.sprayPaint || false,
            projects: []
          };

          await onAddPaint(paintData);
        }
      }

      // Go back to choose mode after adding
      setMode('choose');
    } catch (error) {
      console.error('Error adding paints from catalog:', error);
    }
  };

  const isFormValid = () => {
    const finalBrand = formData.brand === 'custom' ? formData.customBrand : formData.brand;
    const finalType = formData.type === 'custom' ? formData.customType : formData.type;
    return finalBrand && finalType && formData.name && formData.colour;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl mb-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Paint</h3>
        <button
          onClick={onCancel}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">

        {/* Mode Selection */}
        {mode === 'choose' && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 text-center">
              How would you like to add paint?
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode('list')}
                className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group"
              >
                <List className="mx-auto mb-3 text-gray-400 group-hover:text-indigo-500" size={32} />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Find from List</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Browse paint ranges</p>
              </button>

              <button
                onClick={() => setMode('manual')}
                className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group"
              >
                <Edit className="mx-auto mb-3 text-gray-400 group-hover:text-indigo-500" size={32} />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Add Manually</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enter paint details</p>
              </button>
            </div>
          </div>
        )}

        {/* Find from List Mode - Paint Catalog Browser */}
        {mode === 'list' && (
          <PaintCatalogBrowser
            onAddPaints={handleAddFromCatalog}
            onBack={() => setMode('choose')}
          />
        )}

        {/* Manual Mode - Existing Form */}
        {mode === 'manual' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Add Paint Manually</h4>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDisclaimer(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Paint reference disclaimer"
                >
                  <Info size={16} className="w-4 h-4 border border-current rounded-full" />
                </button>
                <button
                  type="button"
                  onClick={() => setMode('choose')}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Back to Options
                </button>
              </div>
            </div>

            {/* Brand Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value, customBrand: ''})}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
                <option value="custom">Add Your Own...</option>
              </select>
              {formData.brand === 'custom' && (
                <input
                  type="text"
                  placeholder="Enter custom brand"
                  value={formData.customBrand}
                  onChange={(e) => setFormData({...formData, customBrand: e.target.value})}
                  className="w-full mt-2 p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              )}
            </div>

            {/* Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value, customType: ''})}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select Type</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
                <option value="custom">Add Your Own...</option>
              </select>
              {formData.type === 'custom' && (
                <input
                  type="text"
                  placeholder="Enter custom type"
                  value={formData.customType}
                  onChange={(e) => setFormData({...formData, customType: e.target.value})}
                  className="w-full mt-2 p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              )}
            </div>

            {/* Paint Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paint Name</label>
              <input
                type="text"
                placeholder="Paint Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              {duplicateWarning && (
                <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    ⚠️ {duplicateWarning} Add anyway?
                  </p>
                </div>
              )}
            </div>

            {/* Colour Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Colour</label>
              <input
                type="text"
                placeholder="e.g., red, blue, metallic silver"
                value={formData.colour}
                onChange={(e) => setFormData({...formData, colour: e.target.value})}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Enter the main colour of this paint for easy filtering
              </div>
            </div>

            {/* Paint Properties and Status */}
            <div className="space-y-3">
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <div className="grid grid-cols-1 gap-2">
                  <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="status"
                      value="listed"
                      checked={formData.status === 'listed'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-4 h-4 border-gray-300 text-gray-600 focus:ring-gray-500"
                    />
                    <span className="font-medium">Listed (reference only)</span>
                  </label>

                  <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="status"
                      value="wishlist"
                      checked={formData.status === 'wishlist'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-4 h-4 border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="font-medium">Add to Wishlist</span>
                  </label>

                  <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="status"
                      value="collection"
                      checked={formData.status === 'collection'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-4 h-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium">Add to Collection (I own this)</span>
                  </label>
                </div>
              </div>

              {/* Paint Properties */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.airbrush}
                    onChange={(e) => setFormData({...formData, airbrush: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium">Airbrush Compatible</span>
                </label>

                <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.sprayPaint}
                    onChange={(e) => setFormData({...formData, sprayPaint: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium">Spray Paint</span>
                </label>
              </div>
            </div>

            {/* Project Selection */}
            {projects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add to Projects (optional)
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-xl p-3 bg-gray-50 dark:bg-gray-700">
                  {projects.map(project => (
                    <label key={project.id} className="flex items-center gap-3 py-1 text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.selectedProjects.includes(project.id)}
                        onChange={() => handleProjectToggle(project.id)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm">{project.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        project.status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        project.status === 'started' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                      }`}>
                        {project.status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 hover:shadow-lg transition-all active:scale-98"
            >
              {loading ? 'Adding...' : 'Add Paint'}
            </button>
          </form>
        )}
      </div>

      {/* Paint Disclaimer Modal */}
      <PaintDisclaimerModal
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
      />
    </div>
  );
};

export default AddPaintForm;