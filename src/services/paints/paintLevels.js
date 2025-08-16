// services/paints/paintLevels.js - All level management functions
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import {
  getCurrentUserId,
  getUserNeedToBuyCollection
} from '../shared/userHelpers.js';
import { findPaintName } from './paintQueries.js';

// =====================================
// ADJUSTING PAINT LEVELS
// =====================================

export const refillPaint = async (searchTerm) => {
  const foundPaint = await findPaintName(searchTerm);
  const userId = getCurrentUserId();
  const needToBuyCollection = getUserNeedToBuyCollection();

  if (foundPaint) {
    await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
      level: 100
    });

    // Remove from needToBuy collection if it exists
    const needToBuyQuery = query(needToBuyCollection, where("name", "==", searchTerm));
    const needToBuySnapshot = await getDocs(needToBuyQuery);

    needToBuySnapshot.forEach(async (docSnap) => {
      await deleteDoc(docSnap.ref);
    });
  }
};

export const reducePaint = async (searchTerm) => {
  const foundPaint = await findPaintName(searchTerm);
  const userId = getCurrentUserId();
  const needToBuyCollection = getUserNeedToBuyCollection();

  if (foundPaint) {
    const newLevel = Math.max(0, foundPaint.level - 10);

    await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
      level: newLevel
    });

    if (newLevel <= 20) {
      // Check if this paint is already in the needToBuy collection
      const existingQuery = query(needToBuyCollection, where("name", "==", foundPaint.name));
      const existingSnapshot = await getDocs(existingQuery);

      if (existingSnapshot.empty) {
        await addDoc(needToBuyCollection, {
          brand: foundPaint.brand,
          type: foundPaint.type,
          name: foundPaint.name,
          colour: foundPaint.colour,
          createdAt: new Date().toISOString()
        });
      }
    }
  }
};

export const updatePaintLevel = async (searchTerm, newLevel) => {
  const foundPaint = await findPaintName(searchTerm);
  const userId = getCurrentUserId();
  const needToBuyCollection = getUserNeedToBuyCollection();

  if (foundPaint) {
    const oldLevel = foundPaint.level;
    await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
      level: newLevel
    });

    // Check if we need to add/remove from needToBuy collection
    if (newLevel <= 20) {
      // Add to needToBuy if not already there
      const existingQuery = query(needToBuyCollection, where("name", "==", foundPaint.name));
      const existingSnapshot = await getDocs(existingQuery);

      if (existingSnapshot.empty) {
        await addDoc(needToBuyCollection, {
          brand: foundPaint.brand,
          type: foundPaint.type,
          name: foundPaint.name,
          colour: foundPaint.colour,
          createdAt: new Date().toISOString()
        });
      }
    } else {
      // Remove from needToBuy if level is now above 20
      const needToBuyQuery = query(needToBuyCollection, where("name", "==", foundPaint.name));
      const needToBuySnapshot = await getDocs(needToBuyQuery);

      needToBuySnapshot.forEach(async (docSnap) => {
        await deleteDoc(docSnap.ref);
      });
    }

    return `${foundPaint.name} level updated from ${oldLevel}% to ${newLevel}%`;
  }
  return "Paint not found";
};