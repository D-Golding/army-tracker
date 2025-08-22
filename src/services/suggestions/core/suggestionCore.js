// services/suggestions/core/suggestionCore.js
// Basic CRUD operations for suggestions

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  increment,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { getCurrentUserId } from '../../shared/userHelpers.js';
import { createFirestoreSegment, createSuggestionId } from '../utils/textNormalization.js';
import { validateSuggestionInput, validateSuggestionMetadata } from './suggestionValidation.js';

// Create a suggestion document
export const createSuggestion = async (manufacturer, game, faction, suggestionText, type = 'faction', metadata = {}) => {
  // Validate input
  const validation = validateSuggestionInput(suggestionText, type);
  if (!validation.isValid) {
    throw new Error(`Invalid suggestion: ${validation.errors.join(', ')}`);
  }

  const metadataValidation = validateSuggestionMetadata(metadata);
  if (!metadataValidation.isValid) {
    throw new Error(`Invalid metadata: ${metadataValidation.errors.join(', ')}`);
  }

  const manufacturerSegment = createFirestoreSegment(manufacturer);
  const gameSegment = createFirestoreSegment(game);
  const factionSegment = faction ? createFirestoreSegment(faction) : null;
  const suggestionId = createSuggestionId(validation.normalized);

  // Build document path based on type with proper odd segment counts
  let docPath;
  if (type === 'unit' && factionSegment) {
    const factionKey = `${manufacturerSegment}_${gameSegment}_${factionSegment}`;
    docPath = `suggestions/${factionKey}/units/${suggestionId}`;
  } else {
    const gameKey = `${manufacturerSegment}_${gameSegment}`;
    docPath = `suggestions/${gameKey}/factions/${suggestionId}`;
  }

  const suggestionDoc = doc(db, docPath);

  const suggestionData = {
    name: validation.normalized,
    originalName: validation.original,
    count: 1,
    firstSeen: serverTimestamp(),
    lastUsed: serverTimestamp(),
    isPromoted: false,
    isBlocked: false,
    reportCount: 0,
    variants: [validation.original],
    type: type,
    // Store the original context for reference
    manufacturer: manufacturerSegment,
    game: gameSegment,
    ...metadataValidation.metadata
  };

  // For unit suggestions, also track the parent faction
  if (type === 'unit') {
    suggestionData.parentFaction = factionSegment;
  }

  await setDoc(suggestionDoc, suggestionData);

  return {
    id: suggestionId,
    path: docPath,
    data: suggestionData
  };
};

// Record usage of an existing suggestion (increment count)
export const recordSuggestionUsage = async (manufacturer, game, faction, suggestionText, type = 'faction', metadata = {}) => {
  // Validate input
  const validation = validateSuggestionInput(suggestionText, type);
  if (!validation.isValid) {
    throw new Error(`Invalid suggestion: ${validation.errors.join(', ')}`);
  }

  const manufacturerSegment = createFirestoreSegment(manufacturer);
  const gameSegment = createFirestoreSegment(game);
  const factionSegment = faction ? createFirestoreSegment(faction) : null;
  const suggestionId = createSuggestionId(validation.normalized);

  // Build document path based on type with proper odd segment counts
  let docPath;
  if (type === 'unit' && factionSegment) {
    const factionKey = `${manufacturerSegment}_${gameSegment}_${factionSegment}`;
    docPath = `suggestions/${factionKey}/units/${suggestionId}`;
  } else {
    const gameKey = `${manufacturerSegment}_${gameSegment}`;
    docPath = `suggestions/${gameKey}/factions/${suggestionId}`;
  }

  const suggestionDoc = doc(db, docPath);

  return await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(suggestionDoc);

    if (docSnap.exists()) {
      // Update existing suggestion
      transaction.update(suggestionDoc, {
        count: increment(1),
        lastUsed: serverTimestamp(),
        variants: arrayUnion(validation.original)
      });

      return {
        id: suggestionId,
        action: 'updated',
        newCount: (docSnap.data().count || 0) + 1
      };
    } else {
      // Create new suggestion
      const suggestionData = {
        name: validation.normalized,
        originalName: validation.original,
        count: 1,
        firstSeen: serverTimestamp(),
        lastUsed: serverTimestamp(),
        isPromoted: false,
        isBlocked: false,
        reportCount: 0,
        variants: [validation.original],
        type: type,
        manufacturer: manufacturerSegment,
        game: gameSegment
      };

      if (type === 'unit') {
        suggestionData.parentFaction = factionSegment;
      }

      transaction.set(suggestionDoc, suggestionData);

      // If creating a unit, increment unit count on parent faction
      if (type === 'unit' && factionSegment) {
        const gameKey = `${manufacturerSegment}_${gameSegment}`;
        const factionDocPath = `suggestions/${gameKey}/factions/${factionSegment}`;
        const factionDoc = doc(db, factionDocPath);
        transaction.update(factionDoc, {
          unitCount: increment(1)
        });
      }

      return {
        id: suggestionId,
        action: 'created',
        newCount: 1
      };
    }
  });
};

// Get a single suggestion by ID
export const getSuggestion = async (manufacturer, game, faction, suggestionId, type = 'faction') => {
  const manufacturerSegment = createFirestoreSegment(manufacturer);
  const gameSegment = createFirestoreSegment(game);
  const factionSegment = faction ? createFirestoreSegment(faction) : null;

  let docPath;
  if (type === 'unit' && factionSegment) {
    const factionKey = `${manufacturerSegment}_${gameSegment}_${factionSegment}`;
    docPath = `suggestions/${factionKey}/units/${suggestionId}`;
  } else {
    const gameKey = `${manufacturerSegment}_${gameSegment}`;
    docPath = `suggestions/${gameKey}/factions/${suggestionId}`;
  }

  const suggestionDoc = doc(db, docPath);
  const docSnap = await getDoc(suggestionDoc);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  }

  return null;
};

// Update suggestion metadata (admin functions)
export const updateSuggestion = async (manufacturer, game, faction, suggestionId, updates, type = 'faction') => {
  const manufacturerSegment = createFirestoreSegment(manufacturer);
  const gameSegment = createFirestoreSegment(game);
  const factionSegment = faction ? createFirestoreSegment(faction) : null;

  let docPath;
  if (type === 'unit' && factionSegment) {
    const factionKey = `${manufacturerSegment}_${gameSegment}_${factionSegment}`;
    docPath = `suggestions/${factionKey}/units/${suggestionId}`;
  } else {
    const gameKey = `${manufacturerSegment}_${gameSegment}`;
    docPath = `suggestions/${gameKey}/factions/${suggestionId}`;
  }

  const suggestionDoc = doc(db, docPath);

  // Add timestamp to updates
  const updateData = {
    ...updates,
    updatedAt: serverTimestamp()
  };

  await updateDoc(suggestionDoc, updateData);

  return {
    id: suggestionId,
    path: docPath,
    updatedFields: Object.keys(updates)
  };
};

// Delete a suggestion (admin function)
export const deleteSuggestion = async (manufacturer, game, faction, suggestionId, type = 'faction') => {
  const manufacturerSegment = createFirestoreSegment(manufacturer);
  const gameSegment = createFirestoreSegment(game);
  const factionSegment = faction ? createFirestoreSegment(faction) : null;

  let docPath;
  if (type === 'unit' && factionSegment) {
    const factionKey = `${manufacturerSegment}_${gameSegment}_${factionSegment}`;
    docPath = `suggestions/${factionKey}/units/${suggestionId}`;
  } else {
    const gameKey = `${manufacturerSegment}_${gameSegment}`;
    docPath = `suggestions/${gameKey}/factions/${suggestionId}`;
  }

  const suggestionDoc = doc(db, docPath);

  await deleteDoc(suggestionDoc);

  // If deleting a unit, decrement unit count on parent faction
  if (type === 'unit' && factionSegment) {
    const gameKey = `${manufacturerSegment}_${gameSegment}`;
    const factionDocPath = `suggestions/${gameKey}/factions/${factionSegment}`;
    const factionDoc = doc(db, factionDocPath);
    await updateDoc(factionDoc, {
      unitCount: increment(-1)
    });
  }

  return {
    id: suggestionId,
    path: docPath,
    deleted: true
  };
};