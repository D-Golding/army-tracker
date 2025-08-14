// components/projects/GameSelector.jsx
import React from 'react';
import { getGamesForManufacturer } from '../../data/manufacturerData';

const GameSelector = ({
  selectedManufacturer,
  customManufacturer,
  selectedGame,
  customGame,
  onGameChange,
  onCustomGameChange,
  disabled = false,
  error = null
}) => {
  // Determine the effective manufacturer
  const effectiveManufacturer = selectedManufacturer === 'custom'
    ? customManufacturer
    : selectedManufacturer;

  // Get available games for the selected manufacturer
  const availableGames = getGamesForManufacturer(effectiveManufacturer);

  // Determine if we should show the game selector
  const hasManufacturer = effectiveManufacturer && effectiveManufacturer.trim();
  const showCustomInput = selectedGame === 'custom';

  const handleGameChange = (e) => {
    const value = e.target.value;
    onGameChange(value);
  };

  const handleCustomGameChange = (e) => {
    onCustomGameChange(e.target.value);
  };

  return (
    <div>
      <label className="form-label">
        Game <span className="text-gray-500">(optional)</span>
      </label>

      {hasManufacturer ? (
        <div className="space-y-3">
          <select
            value={selectedGame}
            onChange={handleGameChange}
            className={`form-select ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
            disabled={disabled}
          >
            <option value="">Select a game...</option>
            {availableGames.map(game => (
              <option key={game} value={game}>
                {game}
              </option>
            ))}
            <option value="custom">+ Add custom game</option>
          </select>

          {/* Custom Game Input */}
          {showCustomInput && (
            <div className="ml-4">
              <input
                type="text"
                value={customGame}
                onChange={handleCustomGameChange}
                className={`form-input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter game name"
                disabled={disabled}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="form-select opacity-50 cursor-not-allowed flex items-center justify-center py-3">
          Select a manufacturer first (optional)
        </div>
      )}

      <div className="form-help">
        Choose the specific game or army you're painting (optional)
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

export default GameSelector;