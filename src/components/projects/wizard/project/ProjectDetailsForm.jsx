// components/projects/wizard/project/ProjectDetailsForm.jsx - Updated with popular manufacturers
import React, { useState, useEffect } from 'react';
import { FileText, Info, Star } from 'lucide-react';
import { getAllManufacturers } from '../../../../data/manufacturerData';
import GameSelector from '../../GameSelector';
import { DIFFICULTY_OPTIONS } from '../../../../utils/projectValidation';
import DisclaimerModal from './DisclaimerModal';
import { FactionSelector, UnitNameSelector } from '../../../shared/suggestions/index.jsx';
import { getPopularManufacturersCached } from '../../../../services/suggestions/features/popularManufacturers.js';

const ProjectDetailsForm = ({
  formData,
  onFieldChange,
  onManufacturerChange,
  onGameChange,
  errors = {},
  isLoading = false
}) => {
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [popularManufacturers, setPopularManufacturers] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  // Load popular manufacturers on component mount
  useEffect(() => {
    const loadPopularManufacturers = async () => {
      try {
        setLoadingPopular(true);
        const popular = await getPopularManufacturersCached(5);
        setPopularManufacturers(popular);
      } catch (error) {
        console.error('Error loading popular manufacturers:', error);
      } finally {
        setLoadingPopular(false);
      }
    };

    loadPopularManufacturers();
  }, []);

  // Get all manufacturers for dropdown
  const allManufacturers = getAllManufacturers();

  // Create organized manufacturer list
  const organizedManufacturers = React.useMemo(() => {
    const popularNames = popularManufacturers.map(p => p.displayName);
    const otherManufacturers = allManufacturers.filter(m => !popularNames.includes(m));

    return {
      popular: popularManufacturers,
      others: otherManufacturers
    };
  }, [popularManufacturers, allManufacturers]);

  const handleManufacturerChange = (e) => {
    const selectedManufacturer = e.target.value;
    onManufacturerChange(selectedManufacturer);
  };

  // Get final manufacturer and game values for suggestions
  const getFinalManufacturer = () => {
    return formData.manufacturer === 'custom'
      ? formData.customManufacturer
      : formData.manufacturer;
  };

  const getFinalGame = () => {
    return formData.game === 'custom'
      ? formData.customGame
      : formData.game;
  };

  // Handle faction selection from autocomplete
  const handleFactionSelect = (factionValue, suggestion) => {
    onFieldChange('faction', factionValue);

    // Clear unit name when faction changes
    if (formData.unitName) {
      onFieldChange('unitName', '');
    }

    console.log('📝 Faction selected:', factionValue, suggestion ? `(${suggestion.count} uses)` : '(new)');
  };

  // Handle unit selection from autocomplete
  const handleUnitSelect = (unitValue, suggestion) => {
    onFieldChange('unitName', unitValue);
    console.log('📝 Unit selected:', unitValue, suggestion ? `(${suggestion.count} uses)` : '(new)');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Project Details
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter the basic information for your painting project
        </p>
      </div>

      {/* Project Name - Required */}
      <div>
        <label className="form-label">
          Project Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onFieldChange('name', e.target.value)}
          className={`form-input ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
          placeholder="e.g., Space Marine Squad, Napoleonic British Infantry"
          disabled={isLoading}
          autoFocus
        />
        <div className="form-help">
          Give your project a descriptive name
        </div>
        {errors.name && (
          <div className="form-error">{errors.name}</div>
        )}
      </div>

      {/* Difficulty - Required but has default */}
      <div>
        <label className="form-label">
          Difficulty Level
        </label>
        <select
          value={formData.difficulty}
          onChange={(e) => onFieldChange('difficulty', e.target.value)}
          className={`form-select ${errors.difficulty ? 'border-red-500 focus:ring-red-500' : ''}`}
          disabled={isLoading}
        >
          {DIFFICULTY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="form-help">
          How challenging is this project for you?
        </div>
        {errors.difficulty && (
          <div className="form-error">{errors.difficulty}</div>
        )}
      </div>

      {/* Manufacturer Selection - NOW WITH POPULAR SECTION */}
      <div>
        <label className="form-label">
          Manufacturer <span className="text-gray-500">(optional)</span>
        </label>
        <select
          value={formData.manufacturer === 'custom' ? 'custom' : formData.manufacturer}
          onChange={handleManufacturerChange}
          className={`form-select ${errors.manufacturer ? 'border-red-500 focus:ring-red-500' : ''}`}
          disabled={isLoading}
        >
          <option value="">Select manufacturer...</option>

          {/* Popular Manufacturers Section */}
          {!loadingPopular && organizedManufacturers.popular.length > 0 && (
            <>
              <optgroup label="Popular">
                {organizedManufacturers.popular.map(manufacturer => (
                  <option key={manufacturer.displayName} value={manufacturer.displayName}>
                    {manufacturer.displayName}
                  </option>
                ))}
              </optgroup>
            </>
          )}

          {/* All Other Manufacturers */}
          <optgroup label={organizedManufacturers.popular.length > 0 ? "All Manufacturers" : "Manufacturers"}>
            {organizedManufacturers.others.map(manufacturer => (
              <option key={manufacturer} value={manufacturer}>
                {manufacturer}
              </option>
            ))}
          </optgroup>

          <option value="custom">Other manufacturers...</option>
        </select>

        <div className="form-help">
          {loadingPopular ? (
            'Loading popular manufacturers...'
          ) : organizedManufacturers.popular.length > 0 ? (
            'Popular manufacturers are shown at the top based on community usage'
          ) : (
            'Select the manufacturer of your miniatures (optional)'
          )}
        </div>

        {errors.manufacturer && (
          <div className="form-error">{errors.manufacturer}</div>
        )}

        {/* Custom Manufacturer Input */}
        {formData.manufacturer === 'custom' && (
          <div className="mt-3">
            <input
              type="text"
              value={formData.customManufacturer}
              onChange={(e) => onFieldChange('customManufacturer', e.target.value)}
              className="form-input"
              placeholder="Enter manufacturer name"
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      {/* Game Selection - Optional */}
      <GameSelector
        selectedManufacturer={formData.manufacturer}
        customManufacturer={formData.customManufacturer}
        selectedGame={formData.game}
        customGame={formData.customGame}
        onGameChange={onGameChange}
        onCustomGameChange={(value) => onFieldChange('customGame', value)}
        disabled={isLoading}
        error={errors.game}
      />

      {/* Disclaimer Section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowDisclaimerModal(true)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            disabled={isLoading}
          >
            <Info size={20} />
          </button>
          <button
            type="button"
            onClick={() => setShowDisclaimerModal(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            disabled={isLoading}
          >
            View disclaimer and reporting information
          </button>
        </div>
      </div>

      {/* Faction/Army/Nation Field - With Autocomplete */}
      <div>
        <label className="form-label">
          Faction / Army / Nation etc. <span className="text-gray-500">(Optional)</span>
        </label>
        <FactionSelector
          manufacturer={getFinalManufacturer()}
          game={getFinalGame()}
          value={formData.faction || ''}
          onChange={(value) => onFieldChange('faction', value)}
          onSelect={handleFactionSelect}
          placeholder="e.g., Space Marines, British Army, Elves"
          disabled={isLoading}
          error={errors.faction}
          showIcon={true}
          maxSuggestions={8}
          className="w-full"
        />
      </div>

      {/* Unit Name/Character Name Field - With Autocomplete */}
      <div>
        <label className="form-label">
          Unit name / Character name etc. <span className="text-gray-500">(Optional)</span>
        </label>
        <UnitNameSelector
          manufacturer={getFinalManufacturer()}
          game={getFinalGame()}
          faction={formData.faction}
          value={formData.unitName || ''}
          onChange={(value) => onFieldChange('unitName', value)}
          onSelect={handleUnitSelect}
          placeholder="e.g., Tactical Squad, Captain Lysander, Riflemen"
          disabled={isLoading}
          error={errors.unitName}
          showIcon={true}
          maxSuggestions={8}
          className="w-full"
        />
      </div>

      {/* Description - Optional */}
      <div>
        <label className="form-label">
          Description <span className="text-gray-500">(optional)</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          className="form-textarea"
          placeholder="Describe your project goals, colour scheme, or inspiration..."
          rows="4"
          disabled={isLoading}
        />
        <div className="form-help">
          Add details about your project vision and goals
        </div>
      </div>

      {/* Disclaimer Modal */}
      <DisclaimerModal
        isOpen={showDisclaimerModal}
        onClose={() => setShowDisclaimerModal(false)}
      />
    </div>
  );
};

export default ProjectDetailsForm;