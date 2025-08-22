// components/shared/suggestions/index.jsx
// Central barrel export for all suggestion components

import React from 'react';

// Core autocomplete components
export { default as FactionSelector } from './FactionSelector.jsx';
export { default as UnitNameSelector } from './UnitNameSelector.jsx';

// Dropdown components
export {
  default as SuggestionDropdown,
  SuggestionDropdownWithHighlight,
  AdminSuggestionDropdown
} from './SuggestionDropdown.jsx';

// Convenience wrapper component that combines both selectors
export const FactionAndUnitSelector = ({
  manufacturer,
  game,
  factionValue = '',
  unitValue = '',
  onFactionChange,
  onUnitChange,
  onFactionSelect,
  onUnitSelect,
  disabled = false,
  required = false,
  showIcons = true,
  className = '',
  layout = 'stacked' // 'stacked' or 'inline'
}) => {
  return (
    <div className={`${layout === 'inline' ? 'grid grid-cols-2 gap-4' : 'space-y-4'} ${className}`}>
      {/* Faction Selector */}
      <FactionSelector
        manufacturer={manufacturer}
        game={game}
        value={factionValue}
        onChange={onFactionChange}
        onSelect={onFactionSelect}
        disabled={disabled}
        required={required}
        showIcon={showIcons}
        className="w-full"
      />

      {/* Unit Selector */}
      <UnitNameSelector
        manufacturer={manufacturer}
        game={game}
        faction={factionValue}
        value={unitValue}
        onChange={onUnitChange}
        onSelect={onUnitSelect}
        disabled={disabled}
        required={required}
        showIcon={showIcons}
        className="w-full"
      />
    </div>
  );
};

// Quick suggestion input (lightweight version without full dropdown)
export const QuickSuggestionInput = ({
  type = 'text',
  suggestions = [],
  onSelect,
  placeholder = 'Type to search...',
  maxSuggestions = 5,
  className = '',
  ...inputProps
}) => {
  const [value, setValue] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = React.useState([]);

  React.useEffect(() => {
    if (value.length >= 2) {
      const filtered = suggestions
        .filter(suggestion =>
          suggestion.name?.toLowerCase().includes(value.toLowerCase()) ||
          suggestion.originalName?.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, maxSuggestions);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [value, suggestions, maxSuggestions]);

  const handleSelect = (suggestion) => {
    const selectedValue = suggestion.originalName || suggestion.name;
    setValue(selectedValue);
    setShowSuggestions(false);
    onSelect?.(selectedValue, suggestion);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        {...inputProps}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder={placeholder}
        className="form-input w-full"
      />

      {showSuggestions && (
        <div className="absolute z-40 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.id || index}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {suggestion.originalName || suggestion.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Multi-select suggestion component
export const MultiSelectSuggestions = ({
  suggestions = [],
  selectedValues = [],
  onSelectionChange,
  placeholder = 'Select multiple items...',
  maxSelections = 10,
  className = ''
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const filteredSuggestions = suggestions.filter(suggestion => {
    const name = (suggestion.originalName || suggestion.name || '').toLowerCase();
    const searchMatch = name.includes(inputValue.toLowerCase());
    const notSelected = !selectedValues.some(selected =>
      selected.id === suggestion.id || selected.name === name
    );
    return searchMatch && notSelected;
  });

  const handleSelect = (suggestion) => {
    if (selectedValues.length < maxSelections) {
      const newSelections = [...selectedValues, suggestion];
      onSelectionChange?.(newSelections);
      setInputValue('');
    }
  };

  const handleRemove = (suggestionToRemove) => {
    const newSelections = selectedValues.filter(item =>
      item.id !== suggestionToRemove.id && item.name !== suggestionToRemove.name
    );
    onSelectionChange?.(newSelections);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Items */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedValues.map((item, index) => (
            <span
              key={item.id || index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-md"
            >
              {item.originalName || item.name}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder={selectedValues.length >= maxSelections ? 'Maximum selections reached' : placeholder}
        disabled={selectedValues.length >= maxSelections}
        className="form-input w-full"
      />

      {/* Dropdown */}
      {isOpen && inputValue.length >= 1 && filteredSuggestions.length > 0 && (
        <div className="absolute z-40 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.slice(0, 10).map((suggestion, index) => (
            <button
              key={suggestion.id || index}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="font-medium">{suggestion.originalName || suggestion.name}</div>
              {suggestion.count && (
                <div className="text-xs text-gray-500">Used {suggestion.count} times</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Suggestion statistics display component
export const SuggestionStats = ({
  manufacturer,
  game,
  className = ''
}) => {
  const [stats, setStats] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (manufacturer && game) {
      setIsLoading(true);
      // Import here to avoid circular dependency
      import('../../../services/suggestions/index.js')
        .then(({ getSuggestionStats }) => getSuggestionStats(manufacturer, game))
        .then(setStats)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [manufacturer, game]);

  if (!stats) return null;

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        Suggestion Database Stats
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500 dark:text-gray-400">Factions</div>
          <div className="font-medium">{stats.totalFactions}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Units</div>
          <div className="font-medium">{stats.totalUnits}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Total Usage</div>
          <div className="font-medium">{stats.totalUsage}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Avg Usage</div>
          <div className="font-medium">{stats.averageUsagePerFaction}</div>
        </div>
      </div>
    </div>
  );
};