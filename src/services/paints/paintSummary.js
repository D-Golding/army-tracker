// services/paints/paintSummary.js - Summary and analytics functions
import {
  collection,
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { auth } from '../../firebase.js';

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.uid;
};

// Helper function to get user's paints collection reference
const getUserPaintsCollection = () => {
  const userId = getCurrentUserId();
  return collection(db, 'users', userId, 'paints');
};

// Helper function to get user's needToBuy collection reference
const getUserNeedToBuyCollection = () => {
  const userId = getCurrentUserId();
  return collection(db, 'users', userId, 'needToBuy');
};

// =====================================
// DISPLAY AND VIEW FUNCTIONS
// =====================================

export const getInventorySummary = async () => {
  const paintsCollection = getUserPaintsCollection();
  const needToBuyCollection = getUserNeedToBuyCollection();

  const paintsSnapshot = await getDocs(paintsCollection);
  const needToBuySnapshot = await getDocs(needToBuyCollection);

  let totalPaints = paintsSnapshot.size;
  let collectionPaints = 0;
  let wishlistPaints = 0;
  let listedPaints = 0;
  let lowStockPaints = 0;
  let emptyPaints = 0;
  let sprayPaints = 0;
  let airbrushPaints = 0;
  let paintsUsedInProjects = 0; // New counter
  const colourCounts = {};

  paintsSnapshot.forEach((doc) => {
    const paint = doc.data();

    // Count by status
    if (paint.status === "collection") collectionPaints++;
    else if (paint.status === "wishlist") wishlistPaints++;
    else if (paint.status === "listed") listedPaints++;

    // Only count levels for collection paints
    if (paint.status === "collection") {
      if (paint.level <= 20) lowStockPaints++;
      if (paint.level === 0) emptyPaints++;
    }

    if (paint.sprayPaint) sprayPaints++;
    if (paint.airbrush) airbrushPaints++;

    // Count paints used in projects (any paint with projects array length > 0)
    if (paint.projects && paint.projects.length > 0) {
      paintsUsedInProjects++;
    }

    // Count colours
    if (paint.colour) {
      colourCounts[paint.colour] = (colourCounts[paint.colour] || 0) + 1;
    }
  });

  return {
    total: totalPaints,
    collection: collectionPaints,
    wishlist: wishlistPaints,
    listed: listedPaints,
    lowStock: lowStockPaints,
    empty: emptyPaints,
    needToBuy: needToBuySnapshot.size,
    sprayPaints,
    airbrushPaints,
    usedInProjects: paintsUsedInProjects, // New field
    colourCounts
  };
};