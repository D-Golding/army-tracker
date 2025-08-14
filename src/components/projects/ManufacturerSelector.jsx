// components/projects/ManufacturerSelector.jsx
import React from 'react';
import { Check } from 'lucide-react';
import { TOP_MANUFACTURERS, OTHER_MANUFACTURERS, MANUFACTURER_GAMES } from '../../data/manufacturerData';

const ManufacturerSelector = ({
  selectedManufacturer,
  customManufacturer,
  onManufacturerChange,
  onCustomManufacturerChange,
  disabled = false,
  error = null
}) => {
  const showCustomInput = selectedManufacturer === 'custom';

  const handleRadioChange = (manufacturer) => {
    onManufacturerChange(manufacturer);
  };

  const handleDropdownChange = (e) => {
    const value = e.target.value;
    onManufacturerChange(value);
  };

  const handleCustomInputChange = (e) => {
    onCustomManufacturerChange(e.target.value);
  };

  // Check if a manufacturer from dropdown is selected
  const isDropdownSelected = selectedManufacturer &&
    !TOP_MANUFACTURERS.includes(selectedManufacturer) &&
    selectedManufacturer !== 'custom';

  return (
    <div>
      <label className="form-label">
        Manufacturer <span className="text-gray-500">(optional)</span>
      </label>

      {/* Top 3 Radio Buttons */}
      <div className="space-y-3 mb-4">
        {TOP_MANUFACTURERS.map((manufacturer) => (
          <label
            key={manufacturer}
            className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
              selectedManufacturer === manufacturer
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name="manufacturer"
              value={manufacturer}
              checked={selectedManufacturer === manufacturer}
              onChange={() => handleRadioChange(manufacturer)}
              disabled={disabled}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
              selectedManufacturer === manufacturer
                ? 'border-indigo-500 bg-indigo-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              {selectedManufacturer === manufacturer && (
                <Check size={12} className="text-white" />
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {manufacturer}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {MANUFACTURER_GAMES[manufacturer]?.length || 0} games available
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Other Manufacturers Dropdown */}
      <div className="space-y-3">
        <select
          value={isDropdownSelected ? selectedManufacturer : (selectedManufacturer === 'custom' ? 'custom' : '')}
          onChange={handleDropdownChange}
          className={`form-select ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
          disabled={disabled}
        >
          <option value="">Other manufacturers...</option>
          {OTHER_MANUFACTURERS.map(manufacturer => (
            <option key={manufacturer} value={manufacturer}>
              {manufacturer}
            </option>
          ))}
          <option value="custom">+ Add custom manufacturer</option>
        </select>

        {/* Custom Manufacturer Input */}
        {showCustomInput && (
          <div className="ml-4">
            <input
              type="text"
              value={customManufacturer}
              onChange={handleCustomInputChange}
              className={`form-input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Enter manufacturer name"
              disabled={disabled}
            />
          </div>
        )}
      </div>

      <div className="form-help">
        Select the manufacturer of your miniatures (optional)
      </div>

      {/* Error Display */}
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default ManufacturerSelector;