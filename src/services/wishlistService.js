// services/wishlistService.js - Updated for user-specific data with shared utilities
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { getCurrentUserId, getUserWishlistCollection } from './shared/userHelpers.js';
import { newPaint } from './paints/index.js';

// =====================================
// WISHLIST MANAGEMENT FUNCTIONS
// =====================================

export const addToWishlist = async (brand, type, name, airbrush = false, sprayPaint = false, notes = "") => {
  const wishlistCollection = getUserWishlistCollection();

  // Check if item already exists in user's wishlist
  const existingQuery = query(wishlistCollection, where("name", "==", name));
  const existingSnapshot = await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    throw new Error(`${name} is already in your wishlist`);
  }

  await addDoc(wishlistCollection, {
    brand,
    type,
    name,
    airbrush,
    sprayPaint,
    notes,
    dateAdded: new Date().toISOString()
  });

  return `${name} added to wishlist`;
};

export const getWishlistPaints = async () => {
  const wishlistCollection = getUserWishlistCollection();
  const snapshot = await getDocs(wishlistCollection);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });

  // Sort by date added (newest first)
  return results.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
};

export const removeFromWishlist = async (wishlistId) => {
  const userId = getCurrentUserId();
  await deleteDoc(doc(db, 'users', userId, 'wishlist', wishlistId));
  return "Item removed from wishlist";
};

export const markAsPurchased = async (wishlistId) => {
  const userId = getCurrentUserId();

  // Get the wishlist item
  const wishlistDoc = doc(db, 'users', userId, 'wishlist', wishlistId);
  const wishlistCollection = getUserWishlistCollection();
  const wishlistQuery = query(wishlistCollection, where("__name__", "==", wishlistId));
  const wishlistSnapshot = await getDocs(wishlistQuery);

  if (wishlistSnapshot.empty) {
    throw new Error("Wishlist item not found");
  }

  const wishlistItem = wishlistSnapshot.docs[0].data();

  // Add to paint inventory with "collection" status
  await newPaint(
    wishlistItem.brand,
    wishlistItem.airbrush,
    wishlistItem.type,
    wishlistItem.name,
    "collection", // status = collection (purchased)
    100, // level = 100% (new paint)
    null, // no photo URL
    wishlistItem.sprayPaint
  );

  // Remove from wishlist
  await deleteDoc(wishlistDoc);

  return `${wishlistItem.name} moved to paint inventory`;
};

// =====================================
// UTILITY FUNCTIONS
// =====================================

export const getWishlistSummary = async () => {
  const wishlistCollection = getUserWishlistCollection();
  const wishlistSnapshot = await getDocs(wishlistCollection);

  let totalItems = wishlistSnapshot.size;
  let airbrushItems = 0;
  let sprayPaintItems = 0;

  wishlistSnapshot.forEach((doc) => {
    const item = doc.data();
    if (item.airbrush) airbrushItems++;
    if (item.sprayPaint) sprayPaintItems++;
  });

  return {
    total: totalItems,
    airbrush: airbrushItems,
    sprayPaint: sprayPaintItems
  };
};

export const findWishlistItem = async (paintName) => {
  const wishlistCollection = getUserWishlistCollection();
  const q = query(wishlistCollection, where("name", "==", paintName));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};