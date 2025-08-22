// components/shared/suggestions/UnitNameSelector.jsx
// Autocomplete unit name input component

import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, X, Loader2, AlertCircle } from 'lucide-react';
import { useUnitSuggestions } from '../../../hooks/suggestions/useUnitSuggestions.js';

const UnitNameSelector = ({
  manufacturer,
  game,
  faction,
  value = '',
  onChange,
  onSelect,
  placeholder = 'e.g., Tactical Squad, Captain, Riflemen',
  disabled = false,
  error = null,
  required = false,
  className = '',
  showIcon = true,
  maxSuggestions = 8
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Get unit suggestions
  const {
    searchTerm,
    suggestions,
    isLoading,
    error: suggestionError,
    handleSearchChange,
    selectUnit,
    clearSuggestions,
    canShowSuggestions,
    hasResults,
    hasValidContext,
    needsFaction,
    isDisabled,
    getStatusMessage
  } = useUnitSuggestions(manufacturer, game, faction, {
    maxResults: maxSuggestions,
    minSearchLength: 1
  });

  // Sync internal state with external value
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
      handleSearchChange(value);
    }
  }, [value, inputValue, handleSearchChange]);

  // Clear input when faction changes
  useEffect(() => {
    if (!faction && inputValue) {
      setInputValue('');
      onChange?.('');
      onSelect?.('', null);
      clearSuggestions();
    }
  }, [faction, inputValue, onChange, onSelect, clearSuggestions]);

  // Handle input changes
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    handleSearchChange(newValue);
    onChange?.(newValue);

    if (!isOpen && newValue.length > 0 && hasValidContext) {
      setIsOpen(true);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion) => {
    const selectedValue = suggestion.originalName || suggestion.name;
    setInputValue(selectedValue);
    setIsOpen(false);

    // Record the selection
    await selectUnit(selectedValue, {
      source: 'dropdown_selection',
      context: 'unit_selector'
    });

    onChange?.(selectedValue);
    onSelect?.(selectedValue, suggestion);
    clearSuggestions();
  };

  // Handle manual input (user types and presses enter or blurs)
  const handleManualInput = async () => {
    if (inputValue && inputValue.trim() && hasValidContext) {
      const trimmedValue = inputValue.trim();
      setInputValue(trimmedValue);
      setIsOpen(false);

      // Record the manual input
      await selectUnit(trimmedValue, {
        source: 'manual_input',
        context: 'unit_selector'
      });

      onChange?.(trimmedValue);
      onSelect?.(trimmedValue, null);
    }
  };

  // Handle key events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (hasResults && suggestions.length > 0) {
        handleSuggestionSelect(suggestions[0]);
      } else if (hasValidContext) {
        handleManualInput();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hasValidContext) {
        setIsOpen(true);
      }
    }
  };

  // Handle blur (when user clicks away)
  const handleBlur = (e) => {
    // Don't close if clicking on dropdown
    if (dropdownRef.current?.contains(e.relatedTarget)) {
      return;
    }

    setTimeout(() => {
      setIsOpen(false);
      if (inputValue !== value && hasValidContext) {
        handleManualInput();
      }
    }, 150);
  };

  // Clear input
  const handleClear = () => {
    setInputValue('');
    setIsOpen(false);
    onChange?.('');
    onSelect?.('', null);
    clearSuggestions();
    inputRef.current?.focus();
  };

  // Show dropdown
  const handleDropdownToggle = () => {
    if (!disabled && hasValidContext) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        inputRef.current?.focus();
      }
    }
  };

  // Check if we can show suggestions
  const canShowDropdown = isOpen && hasValidContext && !disabled && (isLoading || hasResults);
  const showError = error || suggestionError;
  const statusMessage = getStatusMessage();
  const effectivelyDisabled = disabled || isDisabled;

  // Get placeholder text based on context
  const getPlaceholderText = () => {
    if (!manufacturer || !game) return 'Select manufacturer and game first';
    if (!faction) return 'Select faction first';
    return placeholder;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => inputValue.length > 0 && hasValidContext && setIsOpen(true)}
          placeholder={getPlaceholderText()}
          disabled={effectivelyDisabled}
          className={`form-input ${showIcon ? 'pl-10' : ''} pr-16 ${
            showError ? 'border-red-500 focus:ring-red-500' : ''
          } ${effectivelyDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          autoComplete="off"
        />

        {/* Icon */}
        {showIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <User size={16} className={effectivelyDisabled ? 'text-gray-300' : 'text-gray-400'} />
          </div>
        )}

        {/* Right side controls */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Loading spinner */}
          {isLoading && (
            <Loader2 size={14} className="text-gray-400 animate-spin" />
          )}

          {/* Warning icon for missing context */}
          {needsFaction && inputValue && (
            <AlertCircle size={14} className="text-amber-500" title="Faction required" />
          )}

          {/* Clear button */}
          {inputValue && !effectivelyDisabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-1"
              tabIndex={-1}
            >
              <X size={14} />
            </button>
          )}

          {/* Dropdown toggle */}
          {hasValidContext && (
            <button
              type="button"
              onClick={handleDropdownToggle}
              className="text-gray-400 hover:text-gray-600 p-1"
              tabIndex={-1}
              disabled={effectivelyDisabled}
            >
              <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Error/Status Message */}
      {(showError || statusMessage) && (
        <div className={`form-error ${!showError && statusMessage ? 'text-amber-600 dark:text-amber-400' : ''}`}>
          {showError || statusMessage}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {canShowDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
              <Loader2 size={16} className="inline animate-spin mr-2" />
              Loading units for {faction}...
            </div>
          ) : hasResults ? (
            <div className="py-1">
              {/* Faction context header */}
              <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                {faction} Units
              </div>

              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id || index}
                  type="button"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {suggestion.originalName || suggestion.name}
                    </div>
                    {suggestion.isPromoted && (
                      <div className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded">
                        Popular
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
              <div className="text-sm">No units found for {faction}</div>
              <div className="text-xs mt-1">Your input will be saved as a new unit</div>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      {!showError && !statusMessage && (
        <div className="form-help">
          Enter unit type or character name{required ? ' (required)' : ' (optional)'}
          {faction && <span className="text-indigo-600 dark:text-indigo-400"> for {faction}</span>}
        </div>
      )}
    </div>
  );
};

export default UnitNameSelector;