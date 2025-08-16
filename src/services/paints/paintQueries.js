// services/paints/paintQueries.js - All finding and getting functions with pagination
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { getUserPaintsCollection, getCurrentUserId } from '../shared/userHelpers.js';

// =====================================
// PAGINATED QUERIES - NEW
// =====================================

export const getPaintsPaginated = async (pageSize = 20, lastDoc = null, filters = {}) => {
  const paintsCollection = getUserPaintsCollection();

  // Start with base query - always order by createdAt desc for consistency
  let q = query(paintsCollection, orderBy('createdAt', 'desc'));

  // Apply filters before pagination
  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  }

  // Add pagination
  q = query(q, limit(pageSize));

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });

  // Return both results and last document for next page
  return {
    paints: results,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: results.length === pageSize
  };
};

export const getCollectionPaintsPaginated = async (pageSize = 20, lastDoc = null) => {
  return await getPaintsPaginated(pageSize, lastDoc, { status: 'collection' });
};

export const getWishlistPaintsPaginated = async (pageSize = 20, lastDoc = null) => {
  return await getPaintsPaginated(pageSize, lastDoc, { status: 'wishlist' });
};

export const getAirbrushPaintsPaginated = async (pageSize = 20, lastDoc = null) => {
  const paintsCollection = getUserPaintsCollection();

  let q = query(
    paintsCollection,
    where('airbrush', '==', true),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });

  return {
    paints: results,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: results.length === pageSize
  };
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
  const q = query(paintsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

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