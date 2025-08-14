// services/paints/paintQueries.js - All finding and getting functions
import {
  collection,
  getDocs,
  query,
  where
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

// =====================================
// FINDING ITEMS IN FIREBASE
// =====================================

export const findPaintBrand = async (searchTerm) => {
  const paintsCollection = getUserPaintsCollection();
  const q = query(paintsCollection, where("brand", "==", searchTerm));
  const snapshot = await getDocs(q);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });
  return results;
};

export const findPaintType = async (searchTerm) => {
  const paintsCollection = getUserPaintsCollection();
  const q = query(paintsCollection, where("type", "==", searchTerm));
  const snapshot = await getDocs(q);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });
  return results;
};

export const findPaintName = async (searchTerm) => {
  const paintsCollection = getUserPaintsCollection();
  const q = query(paintsCollection, where("name", "==", searchTerm));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const findPaintByStatus = async (status) => {
  const paintsCollection = getUserPaintsCollection();
  const q = query(paintsCollection, where("status", "==", status));
  const snapshot = await getDocs(q);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });
  return results;
};

export const findPaintsByColour = async (colour) => {
  const paintsCollection = getUserPaintsCollection();
  const q = query(paintsCollection, where("colour", "==", colour));
  const snapshot = await getDocs(q);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });
  return results;
};

// =====================================
// GETTING PAINTS BY CATEGORY
// =====================================

export const getCollectionPaints = async () => {
  return await findPaintByStatus("collection");
};

export const getWishlistPaints = async () => {
  return await findPaintByStatus("wishlist");
};

export const getListedPaints = async () => {
  return await findPaintByStatus("listed");
};

export const getAirbrushPaints = async () => {
  const paintsCollection = getUserPaintsCollection();
  const q = query(paintsCollection, where("airbrush", "==", true));
  const snapshot = await getDocs(q);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });
  return results;
};

export const getSprayPaints = async () => {
  const paintsCollection = getUserPaintsCollection();
  const q = query(paintsCollection, where("sprayPaint", "==", true));
  const snapshot = await getDocs(q);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });
  return results;
};

export const getAllPaints = async () => {
  const paintsCollection = getUserPaintsCollection();
  const snapshot = await getDocs(paintsCollection);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });
  return results;
};

// =====================================
// COLOUR-BASED QUERIES
// =====================================

export const getAvailableColours = async () => {
  const allPaints = await getAllPaints();
  const colours = new Set();

  allPaints.forEach(paint => {
    if (paint.colour) {
      colours.add(paint.colour);
    }
  });

  return Array.from(colours).sort();
};

export const getPaintsByColourAndStatus = async (colour, status) => {
  const paintsCollection = getUserPaintsCollection();
  const q = query(
    paintsCollection,
    where("colour", "==", colour),
    where("status", "==", status)
  );
  const snapshot = await getDocs(q);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });
  return results;
};

// =====================================
// LEVEL-BASED QUERIES
// =====================================

export const getPaintsByLevel = async (levelCheck) => {
  const paintsCollection = getUserPaintsCollection();
  const q = query(
    paintsCollection,
    where("level", "<=", levelCheck),
    where("status", "==", "collection") // Only check collection paints
  );
  const snapshot = await getDocs(q);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });
  return results;
};

export const showPaintLevel = async (searchTerm) => {
  const foundPaint = await findPaintName(searchTerm);

  if (foundPaint) {
    return foundPaint.level;
  }
  return "Paint not found";
};