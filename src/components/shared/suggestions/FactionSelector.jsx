// components/shared/suggestions/FactionSelector.jsx
// Autocomplete faction input component

import React, { useState, useRef, useEffect } from 'react';
import { Shield, ChevronDown, X, Loader2 } from 'lucide-react';
import { useFactionSuggestions } from '../../../hooks/suggestions/useFactionSuggestions.js';

const FactionSelector = ({
  manufacturer,
  game,
  value = '',
  onChange,
  onSelect,
  placeholder = 'e.g., Space Marines, Elves, Imperial Guard',
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

  // Get faction suggestions
  const factionHook = useFactionSuggestions(manufacturer, game, {
    maxResults: maxSuggestions,
    minSearchLength: 1
  });

  // Destructure with default values to prevent undefined errors
  const {
    searchTerm = '',
    suggestions = [],
    isLoading = false,
    error: suggestionError = null,
    handleSearchChange = () => {},
    selectFaction = () => {},
    clearSuggestions = () => {},
    canShowSuggestions = false,
    hasResults = false
  } = factionHook || {};

  // Sync internal state with external value
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
      if (handleSearchChange) {
        handleSearchChange(value);
      }
    }
  }, [value, inputValue, handleSearchChange]);

  // Handle input changes
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (handleSearchChange) {
      handleSearchChange(newValue);
    }
    onChange?.(newValue);

    if (!isOpen && newValue.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion) => {
    const selectedValue = suggestion.originalName || suggestion.name;
    setInputValue(selectedValue);
    setIsOpen(false);

    // Record the selection
    if (selectFaction) {
      await selectFaction(selectedValue, {
        source: 'dropdown_selection',
        context: 'faction_selector'
      });
    }

    onChange?.(selectedValue);
    onSelect?.(selectedValue, suggestion);
    if (clearSuggestions) {
      clearSuggestions();
    }
  };

  // Handle manual input (user types and presses enter or blurs)
  const handleManualInput = async () => {
    if (inputValue && inputValue.trim()) {
      const trimmedValue = inputValue.trim();
      setInputValue(trimmedValue);
      setIsOpen(false);

      // Record the manual input
      if (selectFaction) {
        await selectFaction(trimmedValue, {
          source: 'manual_input',
          context: 'faction_selector'
        });
      }

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
      } else {
        handleManualInput();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
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
      if (inputValue !== value) {
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
    if (clearSuggestions) {
      clearSuggestions();
    }
    inputRef.current?.focus();
  };

  // Show dropdown
  const handleDropdownToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        inputRef.current?.focus();
      }
    }
  };

  // Check if we can show suggestions
  const canShowDropdown = isOpen && !disabled && (isLoading || hasResults);
  const hasValidContext = Boolean(manufacturer && game);
  const showError = error || (!hasValidContext && inputValue);

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
          onFocus={() => inputValue.length > 0 && setIsOpen(true)}
          placeholder={hasValidContext ? placeholder : 'Select manufacturer and game first'}
          disabled={disabled || !hasValidContext}
          className={`form-input ${showIcon ? 'pl-10' : ''} pr-16 ${
            showError ? 'border-red-500 focus:ring-red-500' : ''
          } ${disabled || !hasValidContext ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          autoComplete="off"
        />

        {/* Icon */}
        {showIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Shield size={16} className="text-gray-400" />
          </div>
        )}

        {/* Right side controls */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Loading spinner */}
          {isLoading && (
            <Loader2 size={14} className="text-gray-400 animate-spin" />
          )}

          {/* Clear button */}
          {inputValue && !disabled && (
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
            >
              <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {showError && (
        <div className="form-error">
          {error || 'Please select manufacturer and game first'}
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
              Loading factions...
            </div>
          ) : hasResults ? (
            <div className="py-1">
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
                      <div className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                        Popular
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
              <div className="text-sm">No factions found</div>
              <div className="text-xs mt-1">Your input will be saved as a new faction</div>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      {!showError && (
        <div className="form-help">
          Enter faction, army, or nation name{required ? ' (required)' : ' (optional)'}
        </div>
      )}
    </div>
  );
};

export default FactionSelector;