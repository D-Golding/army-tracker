// services/suggestions/features/suggestionRecording.js
// Track user selections and record suggestion usage

import { recordSuggestionUsage } from '../core/suggestionCore.js';
import { validateSuggestionInput } from '../core/suggestionValidation.js';
import { shouldRecordSuggestion } from '../utils/textNormalization.js';

// Record faction usage when user selects/enters a faction
export const recordFactionUsage = async (manufacturer, game, faction, metadata = {}) => {
  // Validate before recording
  if (!shouldRecordSuggestion(faction)) {
    console.log('Skipping faction recording - invalid content:', faction);
    return { recorded: false, reason: 'Invalid content' };
  }

  const validation = validateSuggestionInput(faction, 'faction');
  if (!validation.isValid) {
    console.log('Skipping faction recording - validation failed:', validation.errors);
    return { recorded: false, reason: 'Validation failed', errors: validation.errors };
  }

  try {
    const result = await recordSuggestionUsage(
      manufacturer,
      game,
      null, // faction goes in suggestionText for faction recording
      faction,
      'faction',
      {
        source: 'user_input',
        context: 'project_creation',
        ...metadata
      }
    );

    console.log(`📝 Faction usage recorded: ${faction} (${result.action}, count: ${result.newCount})`);

    return {
      recorded: true,
      action: result.action,
      newCount: result.newCount,
      suggestionId: result.id
    };

  } catch (error) {
    console.error('Error recording faction usage:', error);
    return {
      recorded: false,
      reason: 'Recording failed',
      error: error.message
    };
  }
};

// Record unit usage when user selects/enters a unit name
export const recordUnitUsage = async (manufacturer, game, faction, unitName, metadata = {}) => {
  // Validate inputs
  if (!faction) {
    console.log('Skipping unit recording - faction required');
    return { recorded: false, reason: 'Faction required' };
  }

  if (!shouldRecordSuggestion(unitName)) {
    console.log('Skipping unit recording - invalid content:', unitName);
    return { recorded: false, reason: 'Invalid content' };
  }

  const validation = validateSuggestionInput(unitName, 'unit');
  if (!validation.isValid) {
    console.log('Skipping unit recording - validation failed:', validation.errors);
    return { recorded: false, reason: 'Validation failed', errors: validation.errors };
  }

  try {
    // First ensure the faction exists (record it if new)
    await recordFactionUsage(manufacturer, game, faction, {
      source: 'auto_from_unit',
      context: 'unit_parent_faction',
      ...metadata
    });

    // Then record the unit
    const result = await recordSuggestionUsage(
      manufacturer,
      game,
      faction,
      unitName,
      'unit',
      {
        source: 'user_input',
        context: 'project_creation',
        parentFaction: faction,
        ...metadata
      }
    );

    console.log(`📝 Unit usage recorded: ${unitName} under ${faction} (${result.action}, count: ${result.newCount})`);

    return {
      recorded: true,
      action: result.action,
      newCount: result.newCount,
      suggestionId: result.id,
      parentFaction: faction
    };

  } catch (error) {
    console.error('Error recording unit usage:', error);
    return {
      recorded: false,
      reason: 'Recording failed',
      error: error.message
    };
  }
};

// Record manufacturer usage (for paint brands, etc.)
export const recordManufacturerUsage = async (manufacturer, context = 'general', metadata = {}) => {
  if (!shouldRecordSuggestion(manufacturer)) {
    console.log('Skipping manufacturer recording - invalid content:', manufacturer);
    return { recorded: false, reason: 'Invalid content' };
  }

  const validation = validateSuggestionInput(manufacturer, 'manufacturer');
  if (!validation.isValid) {
    console.log('Skipping manufacturer recording - validation failed:', validation.errors);
    return { recorded: false, reason: 'Validation failed', errors: validation.errors };
  }

  try {
    // Use a special path for manufacturers (not tied to specific games)
    const result = await recordSuggestionUsage(
      'global',
      'manufacturers',
      null,
      manufacturer,
      'manufacturer',
      {
        source: 'user_input',
        context: context,
        ...metadata
      }
    );

    console.log(`📝 Manufacturer usage recorded: ${manufacturer} (${result.action}, count: ${result.newCount})`);

    return {
      recorded: true,
      action: result.action,
      newCount: result.newCount,
      suggestionId: result.id
    };

  } catch (error) {
    console.error('Error recording manufacturer usage:', error);
    return {
      recorded: false,
      reason: 'Recording failed',
      error: error.message
    };
  }
};

// Record game usage
export const recordGameUsage = async (manufacturer, game, metadata = {}) => {
  if (!shouldRecordSuggestion(game)) {
    console.log('Skipping game recording - invalid content:', game);
    return { recorded: false, reason: 'Invalid content' };
  }

  const validation = validateSuggestionInput(game, 'game');
  if (!validation.isValid) {
    console.log('Skipping game recording - validation failed:', validation.errors);
    return { recorded: false, reason: 'Validation failed', errors: validation.errors };
  }

  try {
    // Record game under manufacturer
    const result = await recordSuggestionUsage(
      manufacturer,
      'games',
      null,
      game,
      'game',
      {
        source: 'user_input',
        context: 'project_creation',
        parentManufacturer: manufacturer,
        ...metadata
      }
    );

    console.log(`📝 Game usage recorded: ${game} under ${manufacturer} (${result.action}, count: ${result.newCount})`);

    return {
      recorded: true,
      action: result.action,
      newCount: result.newCount,
      suggestionId: result.id,
      parentManufacturer: manufacturer
    };

  } catch (error) {
    console.error('Error recording game usage:', error);
    return {
      recorded: false,
      reason: 'Recording failed',
      error: error.message
    };
  }
};

// Record multiple suggestions in batch (for efficiency)
export const recordBatchUsage = async (suggestions = []) => {
  const results = [];

  for (const suggestion of suggestions) {
    const { type, manufacturer, game, faction, value, metadata } = suggestion;

    let result;
    switch (type) {
      case 'faction':
        result = await recordFactionUsage(manufacturer, game, value, metadata);
        break;

      case 'unit':
        result = await recordUnitUsage(manufacturer, game, faction, value, metadata);
        break;

      case 'manufacturer':
        result = await recordManufacturerUsage(value, metadata?.context, metadata);
        break;

      case 'game':
        result = await recordGameUsage(manufacturer, value, metadata);
        break;

      default:
        result = { recorded: false, reason: 'Unknown type' };
    }

    results.push({
      type,
      value,
      ...result
    });
  }

  const successCount = results.filter(r => r.recorded).length;
  const failCount = results.length - successCount;

  console.log(`📝 Batch recording complete: ${successCount} success, ${failCount} failed`);

  return {
    total: results.length,
    successful: successCount,
    failed: failCount,
    results
  };
};

// Record project creation with all suggestion data
export const recordProjectCreationSuggestions = async (projectData) => {
  const suggestions = [];

  // Add manufacturer if custom
  if (projectData.manufacturer && projectData.manufacturer !== 'custom') {
    suggestions.push({
      type: 'manufacturer',
      value: projectData.manufacturer,
      metadata: { context: 'project_creation' }
    });
  }

  // Add game if present
  if (projectData.game) {
    suggestions.push({
      type: 'game',
      manufacturer: projectData.manufacturer,
      value: projectData.game,
      metadata: { context: 'project_creation' }
    });
  }

  // Add faction if present
  if (projectData.faction) {
    suggestions.push({
      type: 'faction',
      manufacturer: projectData.manufacturer,
      game: projectData.game,
      value: projectData.faction,
      metadata: {
        context: 'project_creation',
        projectName: projectData.name
      }
    });
  }

  // Add unit if present
  if (projectData.unitName && projectData.faction) {
    suggestions.push({
      type: 'unit',
      manufacturer: projectData.manufacturer,
      game: projectData.game,
      faction: projectData.faction,
      value: projectData.unitName,
      metadata: {
        context: 'project_creation',
        projectName: projectData.name
      }
    });
  }

  if (suggestions.length === 0) {
    return { recorded: false, reason: 'No suggestions to record' };
  }

  const batchResult = await recordBatchUsage(suggestions);

  console.log(`📝 Project creation suggestions recorded for "${projectData.name}":`, batchResult);

  return batchResult;
};

// Get recording statistics (for debugging)
export const getRecordingStats = () => {
  // This would track in-memory stats during the session
  // For now, just return placeholder data
  return {
    sessionsRecorded: 0,
    factionsRecorded: 0,
    unitsRecorded: 0,
    manufacturersRecorded: 0,
    gamesRecorded: 0,
    batchesProcessed: 0,
    errors: 0
  };
};