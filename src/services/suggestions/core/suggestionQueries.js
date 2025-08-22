// services/suggestions/core/suggestionQueries.js
// Search and filtering operations for suggestions

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAt,
  endAt
} from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { createFirestoreSegment } from '../utils/textNormalization.js';
import { shouldShowSuggestion, sortSuggestionsByRelevance } from '../utils/thresholdCalculator.js';
import { validateSuggestionQuery } from './suggestionValidation.js';

// Get faction suggestions for autocomplete - IMPROVED VERSION
export const getFactionSuggestions = async (manufacturer, game, searchTerm = '', maxResults = 10) => {
  console.log('🔍 DEBUG getFactionSuggestions called with:', {
    manufacturer,
    game,
    searchTerm,
    maxResults
  });

  // Validate inputs
  const validation = validateSuggestionQuery(manufacturer, game, searchTerm, 'faction');
  if (!validation.isValid) {
    console.log('🔍 DEBUG validation failed:', validation.errors);
    throw new Error(`Invalid query: ${validation.errors.join(', ')}`);
  }

  // Create safe Firestore path segments
  const manufacturerSegment = createFirestoreSegment(manufacturer);
  const gameSegment = createFirestoreSegment(game);
  const searchSegment = createFirestoreSegment(searchTerm);

  console.log('🔍 DEBUG segments:', {
    manufacturerSegment,
    gameSegment,
    searchSegment,
    originalSearchTerm: searchTerm
  });

  // Return empty if search term is too short
  if (searchTerm && searchTerm.length < 2) {
    console.log('🔍 DEBUG search term too short');
    return [];
  }

  try {
    const gameKey = `${manufacturerSegment}_${gameSegment}`;
    console.log('🔍 DEBUG gameKey:', gameKey);

    const factionsRef = collection(db, 'suggestions', gameKey, 'factions');
    console.log('🔍 DEBUG collection path:', `suggestions/${gameKey}/factions`);

    // Get ALL non-blocked factions, then filter client-side for more flexible search
    console.log('🔍 DEBUG getting all factions for client-side filtering');
    const q = query(
      factionsRef,
      where('isBlocked', '==', false),
      orderBy('count', 'desc'),
      limit(50) // Get more results to filter from
    );

    console.log('🔍 DEBUG executing query...');
    const snapshot = await getDocs(q);
    console.log('🔍 DEBUG query executed, snapshot.size:', snapshot.size);

    let results = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('🔍 DEBUG found document:', doc.id, data);
      results.push({
        id: doc.id,
        ...data
      });
    });

    console.log('🔍 DEBUG raw results:', results);

    // Client-side filtering for more flexible search
    if (searchTerm && searchTerm.length >= 2) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(suggestion => {
        const nameMatch = suggestion.name?.toLowerCase().includes(lowerSearchTerm);
        const originalNameMatch = suggestion.originalName?.toLowerCase().includes(lowerSearchTerm);
        const match = nameMatch || originalNameMatch;

        if (match) {
          console.log('🔍 DEBUG match found:', suggestion.originalName, 'for search:', searchTerm);
        }

        return match;
      });
    }

    console.log('🔍 DEBUG after client-side filter:', results);

    // Filter by threshold and quality
    results = results.filter(suggestion => shouldShowSuggestion(suggestion, results.length));
    console.log('🔍 DEBUG after threshold filter:', results);

    // Sort by relevance (client-side sorting)
    results = sortSuggestionsByRelevance(results, searchSegment);
    console.log('🔍 DEBUG after relevance sort:', results);

    // Limit final results
    const finalResults = results.slice(0, maxResults);
    console.log('🔍 DEBUG final results:', finalResults);

    return finalResults;

  } catch (error) {
    console.error('🔍 DEBUG Error fetching faction suggestions:', error);
    return [];
  }
};

// Get unit suggestions for autocomplete
export const getUnitSuggestions = async (manufacturer, game, faction, searchTerm = '', maxResults = 10) => {
  // Validate inputs
  const validation = validateSuggestionQuery(manufacturer, game, searchTerm, 'unit');
  if (!validation.isValid) {
    throw new Error(`Invalid query: ${validation.errors.join(', ')}`);
  }

  if (!faction) {
    throw new Error('Faction is required for unit suggestions');
  }

  // Create safe Firestore path segments
  const manufacturerSegment = createFirestoreSegment(manufacturer);
  const gameSegment = createFirestoreSegment(game);
  const factionSegment = createFirestoreSegment(faction);
  const searchSegment = createFirestoreSegment(searchTerm);

  // Return empty if search term is too short
  if (searchTerm && searchTerm.length < 2) {
    return [];
  }

  try {
    const factionKey = `${manufacturerSegment}_${gameSegment}_${factionSegment}`;
    const unitsRef = collection(db, 'suggestions', factionKey, 'units');

    // Get all units and filter client-side for more flexible search
    const q = query(
      unitsRef,
      where('isBlocked', '==', false),
      orderBy('count', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);

    let results = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      results.push({
        id: doc.id,
        ...data
      });
    });

    // Client-side filtering for more flexible search
    if (searchTerm && searchTerm.length >= 2) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(suggestion => {
        const nameMatch = suggestion.name?.toLowerCase().includes(lowerSearchTerm);
        const originalNameMatch = suggestion.originalName?.toLowerCase().includes(lowerSearchTerm);
        return nameMatch || originalNameMatch;
      });
    }

    // Filter by threshold and quality
    results = results.filter(suggestion => shouldShowSuggestion(suggestion, results.length));

    // Sort by relevance (client-side sorting)
    results = sortSuggestionsByRelevance(results, searchSegment);

    // Limit final results
    return results.slice(0, maxResults);

  } catch (error) {
    console.error('Error fetching unit suggestions:', error);
    return [];
  }
};

// Get all factions for a manufacturer/game (for admin or full lists)
export const getAllFactions = async (manufacturer, game, includeBlocked = false) => {
  const validation = validateSuggestionQuery(manufacturer, game, '', 'faction');
  if (!validation.isValid) {
    throw new Error(`Invalid query: ${validation.errors.join(', ')}`);
  }

  const manufacturerSegment = createFirestoreSegment(manufacturer);
  const gameSegment = createFirestoreSegment(game);
  const gameKey = `${manufacturerSegment}_${gameSegment}`;

  const factionsRef = collection(db, 'suggestions', gameKey, 'factions');

  let q;
  if (includeBlocked) {
    q = query(factionsRef, orderBy('count', 'desc'));
  } else {
    q = query(
      factionsRef,
      where('isBlocked', '==', false),
      orderBy('count', 'desc')
    );
  }

  try {
    const snapshot = await getDocs(q);

    const results = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      results.push({
        id: doc.id,
        ...data
      });
    });

    return results;

  } catch (error) {
    console.error('Error fetching all factions:', error);
    return [];
  }
};

// Get all units for a faction (for admin or full lists)
export const getAllUnits = async (manufacturer, game, faction, includeBlocked = false) => {
  const validation = validateSuggestionQuery(manufacturer, game, '', 'unit');
  if (!validation.isValid) {
    throw new Error(`Invalid query: ${validation.errors.join(', ')}`);
  }

  if (!faction) {
    throw new Error('Faction is required');
  }

  const manufacturerSegment = createFirestoreSegment(manufacturer);
  const gameSegment = createFirestoreSegment(game);
  const factionSegment = createFirestoreSegment(faction);
  const factionKey = `${manufacturerSegment}_${gameSegment}_${factionSegment}`;

  const unitsRef = collection(db, 'suggestions', factionKey, 'units');

  let q;
  if (includeBlocked) {
    q = query(unitsRef, orderBy('count', 'desc'));
  } else {
    q = query(
      unitsRef,
      where('isBlocked', '==', false),
      orderBy('count', 'desc')
    );
  }

  try {
    const snapshot = await getDocs(q);

    const results = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      results.push({
        id: doc.id,
        ...data
      });
    });

    return results;

  } catch (error) {
    console.error('Error fetching all units:', error);
    return [];
  }
};

// Search across all suggestions (admin function)
export const searchAllSuggestions = async (searchTerm, type = null, includeBlocked = false, maxResults = 50) => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  const normalizedSearchTerm = createFirestoreSegment(searchTerm);

  // This is a simplified version - in a real implementation you might need
  // to search across multiple collections or use a search service like Algolia
  // For now, this would need to be called for each manufacturer/game combination

  console.warn('searchAllSuggestions requires specific manufacturer/game context in this implementation');
  return [];
};

// Get suggestion statistics for a manufacturer/game
export const getSuggestionStats = async (manufacturer, game) => {
  const validation = validateSuggestionQuery(manufacturer, game, '', 'general');
  if (!validation.isValid) {
    throw new Error(`Invalid query: ${validation.errors.join(', ')}`);
  }

  const manufacturerSegment = createFirestoreSegment(manufacturer);
  const gameSegment = createFirestoreSegment(game);
  const gameKey = `${manufacturerSegment}_${gameSegment}`;

  try {
    // Get faction count
    const factionsRef = collection(db, 'suggestions', gameKey, 'factions');
    const factionsSnapshot = await getDocs(factionsRef);

    let totalFactions = 0;
    let totalUnits = 0;
    let totalUsage = 0;

    factionsSnapshot.forEach((doc) => {
      const data = doc.data();
      totalFactions++;
      totalUsage += data.count || 0;
      totalUnits += data.unitCount || 0;
    });

    return {
      manufacturer: manufacturerSegment,
      game: gameSegment,
      totalFactions,
      totalUnits,
      totalUsage,
      averageUsagePerFaction: totalFactions > 0 ? Math.round(totalUsage / totalFactions) : 0
    };

  } catch (error) {
    console.error('Error fetching suggestion stats:', error);
    return {
      manufacturer: manufacturerSegment,
      game: gameSegment,
      totalFactions: 0,
      totalUnits: 0,
      totalUsage: 0,
      averageUsagePerFaction: 0
    };
  }
};