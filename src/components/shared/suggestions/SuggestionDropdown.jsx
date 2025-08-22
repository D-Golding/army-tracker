// components/shared/suggestions/SuggestionDropdown.jsx
// Reusable dropdown component for suggestions

import React, { forwardRef } from 'react';
import { Loader2, Star, TrendingUp, Clock } from 'lucide-react';

const SuggestionDropdown = forwardRef(({
  isOpen,
  isLoading,
  suggestions = [],
  hasResults,
  onSelect,
  loadingMessage = 'Loading suggestions...',
  emptyMessage = 'No suggestions found',
  emptySubMessage = 'Your input will be saved as new',
  contextLabel = null,
  maxHeight = 'max-h-64',
  className = '',
  showStats = true,
  showBadges = true,
  groupByType = false
}, ref) => {

  if (!isOpen) return null;

  // Group suggestions by type if requested
  const groupedSuggestions = groupByType && hasResults ?
    suggestions.reduce((groups, suggestion) => {
      const type = suggestion.type || 'general';
      if (!groups[type]) groups[type] = [];
      groups[type].push(suggestion);
      return groups;
    }, {}) :
    { default: suggestions };

  // Get badge info for suggestion
  const getBadgeInfo = (suggestion) => {
    if (!showBadges) return null;

    if (suggestion.isPromoted) {
      return {
        text: 'Popular',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        icon: <Star size={10} />
      };
    }

    if (suggestion.count >= 50) {
      return {
        text: 'Trending',
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        icon: <TrendingUp size={10} />
      };
    }

    if (suggestion.count >= 10) {
      return {
        text: 'Used',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        icon: <Clock size={10} />
      };
    }

    return null;
  };

  // Format usage stats
  const formatUsageStats = (suggestion) => {
    if (!showStats || !suggestion.count || suggestion.count <= 1) return null;

    if (suggestion.count < 10) {
      return `Used ${suggestion.count} times`;
    } else if (suggestion.count < 100) {
      return `${suggestion.count} uses`;
    } else {
      return `${Math.round(suggestion.count / 10) * 10}+ uses`;
    }
  };

  // Render suggestion item
  const renderSuggestion = (suggestion, index) => {
    const badge = getBadgeInfo(suggestion);
    const stats = formatUsageStats(suggestion);
    const displayName = suggestion.originalName || suggestion.name;

    return (
      <button
        key={suggestion.id || `${suggestion.name}-${index}`}
        type="button"
        onClick={() => onSelect(suggestion)}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {displayName}
            </div>
            {stats && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {stats}
                {suggestion.parentFaction && (
                  <span className="ml-2">• {suggestion.parentFaction}</span>
                )}
              </div>
            )}
          </div>

          {badge && (
            <div className={`ml-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full ${badge.className}`}>
              {badge.icon}
              <span>{badge.text}</span>
            </div>
          )}
        </div>
      </button>
    );
  };

  // Render group header
  const renderGroupHeader = (groupName, count) => {
    if (groupName === 'default') return null;

    return (
      <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
        {groupName.charAt(0).toUpperCase() + groupName.slice(1)} ({count})
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={`absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg ${maxHeight} overflow-y-auto ${className}`}
    >
      {isLoading ? (
        /* Loading State */
        <div className="p-3 text-center text-gray-500 dark:text-gray-400">
          <Loader2 size={16} className="inline animate-spin mr-2" />
          {loadingMessage}
        </div>
      ) : hasResults ? (
        /* Suggestions */
        <div className="py-1">
          {/* Context Label */}
          {contextLabel && (
            <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
              {contextLabel}
            </div>
          )}

          {/* Grouped Suggestions */}
          {Object.entries(groupedSuggestions).map(([groupName, groupSuggestions]) => (
            <div key={groupName}>
              {renderGroupHeader(groupName, groupSuggestions.length)}
              {groupSuggestions.map((suggestion, index) =>
                renderSuggestion(suggestion, index)
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-3 text-center text-gray-500 dark:text-gray-400">
          <div className="text-sm font-medium">{emptyMessage}</div>
          {emptySubMessage && (
            <div className="text-xs mt-1">{emptySubMessage}</div>
          )}
        </div>
      )}
    </div>
  );
});

SuggestionDropdown.displayName = 'SuggestionDropdown';

export default SuggestionDropdown;

// Enhanced dropdown with search highlighting
export const SuggestionDropdownWithHighlight = forwardRef(({
  searchTerm = '',
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-800',
  ...props
}, ref) => {

  // Highlight matching text
  const highlightText = (text, search) => {
    if (!search || !text) return text;

    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className={highlightClassName}>
          {part}
        </span>
      ) : part
    );
  };

  // Override suggestion rendering to include highlighting
  const enhancedSuggestions = props.suggestions?.map(suggestion => ({
    ...suggestion,
    displayName: highlightText(suggestion.originalName || suggestion.name, searchTerm)
  }));

  return (
    <SuggestionDropdown
      ref={ref}
      {...props}
      suggestions={enhancedSuggestions}
    />
  );
});

SuggestionDropdownWithHighlight.displayName = 'SuggestionDropdownWithHighlight';

// Dropdown variant for admin/management interfaces
export const AdminSuggestionDropdown = forwardRef(({
  onPromote,
  onBlock,
  onDelete,
  showAdminActions = false,
  ...props
}, ref) => {

  const handleSuggestionAction = (action, suggestion, event) => {
    event.stopPropagation(); // Prevent selection

    switch (action) {
      case 'promote':
        onPromote?.(suggestion);
        break;
      case 'block':
        onBlock?.(suggestion);
        break;
      case 'delete':
        onDelete?.(suggestion);
        break;
    }
  };

  // Override suggestion rendering to include admin actions
  const renderAdminSuggestion = (suggestion, index) => {
    const badge = suggestion.isPromoted ? 'Promoted' :
                 suggestion.isBlocked ? 'Blocked' :
                 suggestion.count >= 50 ? 'Popular' : null;

    return (
      <div
        key={suggestion.id || `${suggestion.name}-${index}`}
        className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => props.onSelect(suggestion)}
            className="flex-1 text-left min-w-0"
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {suggestion.originalName || suggestion.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {suggestion.count} uses • ID: {suggestion.id}
              {suggestion.reportCount > 0 && (
                <span className="text-red-600 ml-2">• {suggestion.reportCount} reports</span>
              )}
            </div>
          </button>

          <div className="flex items-center gap-2 ml-2">
            {badge && (
              <span className={`text-xs px-2 py-1 rounded ${
                suggestion.isPromoted ? 'bg-blue-100 text-blue-800' :
                suggestion.isBlocked ? 'bg-red-100 text-red-800' :
                'bg-green-100 text-green-800'
              }`}>
                {badge}
              </span>
            )}

            {showAdminActions && (
              <div className="flex gap-1">
                {!suggestion.isPromoted && !suggestion.isBlocked && (
                  <button
                    onClick={(e) => handleSuggestionAction('promote', suggestion, e)}
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Promote
                  </button>
                )}

                {!suggestion.isBlocked && (
                  <button
                    onClick={(e) => handleSuggestionAction('block', suggestion, e)}
                    className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Block
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={`absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg ${props.maxHeight || 'max-h-96'} overflow-y-auto`}
    >
      {props.isLoading ? (
        <div className="p-3 text-center text-gray-500 dark:text-gray-400">
          <Loader2 size={16} className="inline animate-spin mr-2" />
          {props.loadingMessage || 'Loading...'}
        </div>
      ) : props.hasResults ? (
        <div>
          {props.suggestions?.map((suggestion, index) =>
            renderAdminSuggestion(suggestion, index)
          )}
        </div>
      ) : (
        <div className="p-3 text-center text-gray-500 dark:text-gray-400">
          <div className="text-sm">{props.emptyMessage || 'No suggestions found'}</div>
        </div>
      )}
    </div>
  );
});

AdminSuggestionDropdown.displayName = 'AdminSuggestionDropdown';