// services/paints/needToBuyService.js - Buy again list management
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import {
  getCurrentUserId,
  getUserNeedToBuyCollection
} from '../shared/userHelpers.js';
import { findPaintName } from './paintQueries.js';

// =====================================
// BUY AGAIN / NEED TO BUY FUNCTIONS
// =====================================

export const addToNeedToBuy = async (paintName) => {
  const foundPaint = await findPaintName(paintName);
  const needToBuyCollection = getUserNeedToBuyCollection();

  if (foundPaint) {
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
      return `${foundPaint.name} added to buy again list`;
    } else {
      return `${foundPaint.name} is already in the buy again list`;
    }
  }
  return "Paint not found";
};

export const removeFromNeedToBuy = async (paintName) => {
  const needToBuyCollection = getUserNeedToBuyCollection();
  const needToBuyQuery = query(needToBuyCollection, where("name", "==", paintName));
  const needToBuySnapshot = await getDocs(needToBuyQuery);

  let removedCount = 0;
  needToBuySnapshot.forEach(async (docSnap) => {
    await deleteDoc(docSnap.ref);
    removedCount++;
  });

  return removedCount > 0 ? `${paintName} removed from buy again list` : "Paint not found in buy again list";
};

export const getNeedToBuyList = async () => {
  const needToBuyCollection = getUserNeedToBuyCollection();
  const snapshot = await getDocs(needToBuyCollection);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });
  return results;
};