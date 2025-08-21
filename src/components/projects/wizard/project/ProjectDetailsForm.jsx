// components/projects/wizard/project/ProjectDetailsForm.jsx - Updated for standalone use
import React from 'react';
import { FileText } from 'lucide-react';
import ManufacturerSelector from '../../ManufacturerSelector';
import GameSelector from '../../GameSelector';
import { DIFFICULTY_OPTIONS } from '../../../../utils/projectValidation';

const ProjectDetailsForm = ({
  formData,
  onFieldChange,
  onManufacturerChange,
  onGameChange,
  errors = {},
  isLoading = false
}) => {
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

      {/* Manufacturer Selection - Optional */}
      <ManufacturerSelector
        selectedManufacturer={formData.manufacturer}
        customManufacturer={formData.customManufacturer}
        onManufacturerChange={onManufacturerChange}
        onCustomManufacturerChange={(value) => onFieldChange('customManufacturer', value)}
        disabled={isLoading}
        error={errors.manufacturer}
      />

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
    </div>
  );
};

export default ProjectDetailsForm;