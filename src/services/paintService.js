// services/paintService.js - Updated for user-specific data
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { auth } from '../firebase.js';
import { getAllProjects } from './projectService.js';

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

// Re-export from projectService for convenience
export { getAllProjects } from './projectService.js';

// =====================================
// CORE PAINT MANAGEMENT FUNCTIONS
// =====================================

export const newPaint = async (brand, airbrush, type, name, status = "listed", level, photoURL = null, sprayPaint = false) => {
  const paintsCollection = getUserPaintsCollection();

  await addDoc(paintsCollection, {
    brand,
    airbrush,
    type,
    name,
    status, // "listed", "wishlist", or "collection"
    level,
    photoURL,
    sprayPaint,
    createdAt: new Date().toISOString()
  });
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

    if (newLevel <= 10) {
      // Check if this paint is already in the needToBuy collection
      const existingQuery = query(needToBuyCollection, where("name", "==", foundPaint.name));
      const existingSnapshot = await getDocs(existingQuery);

      if (existingSnapshot.empty) {
        await addDoc(needToBuyCollection, {
          brand: foundPaint.brand,
          type: foundPaint.type,
          name: foundPaint.name,
          createdAt: new Date().toISOString()
        });
      }
    }
  }
};

// =====================================
// STATUS MANAGEMENT FUNCTIONS
// =====================================

export const moveToCollection = async (searchTerm) => {
  const foundPaint = await findPaintName(searchTerm);
  const userId = getCurrentUserId();

  if (foundPaint) {
    await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
      status: "collection",
      level: 100 // New paint starts at 100%
    });
    return `${foundPaint.name} moved to collection`;
  }
  return "Paint not found";
};

export const moveToWishlist = async (searchTerm) => {
  const foundPaint = await findPaintName(searchTerm);
  const userId = getCurrentUserId();

  if (foundPaint) {
    await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
      status: "wishlist"
    });
    return `${foundPaint.name} moved to wishlist`;
  }
  return "Paint not found";
};

export const moveToListed = async (searchTerm) => {
  const foundPaint = await findPaintName(searchTerm);
  const userId = getCurrentUserId();

  if (foundPaint) {
    await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
      status: "listed"
    });
    return `${foundPaint.name} moved to listed`;
  }
  return "Paint not found";
};

// =====================================
// EDITING PAINT DETAILS
// =====================================

export const updatePaintBrand = async (searchTerm, newBrand) => {
  const foundPaint = await findPaintName(searchTerm);
  const userId = getCurrentUserId();

  if (foundPaint) {
    const oldBrand = foundPaint.brand;
    await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
      brand: newBrand
    });
    return `${foundPaint.name} brand updated from ${oldBrand} to ${newBrand}`;
  }
  return "Paint not found";
};

export const updatePaintType = async (searchTerm, newType) => {
  const foundPaint = await findPaintName(searchTerm);
  const userId = getCurrentUserId();

  if (foundPaint) {
    const oldType = foundPaint.type;
    await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
      type: newType
    });
    return `${foundPaint.name} type updated from ${oldType} to ${newType}`;
  }
  return "Paint not found";
};

export const updatePaintName = async (searchTerm, newName) => {
  const foundPaint = await findPaintName(searchTerm);
  const userId = getCurrentUserId();

  if (foundPaint) {
    const oldName = foundPaint.name;
    await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
      name: newName
    });
    return `Paint name updated from ${oldName} to ${newName}`;
  }
  return "Paint not found";
};

export const updatePaintPhoto = async (searchTerm, newPhotoURL) => {
  const foundPaint = await findPaintName(searchTerm);
  const userId = getCurrentUserId();

  if (foundPaint) {
    const oldPhoto = foundPaint.photoURL || "No photo";
    await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
      photoURL: newPhotoURL
    });
    return `${foundPaint.name} photo updated from ${oldPhoto} to ${newPhotoURL}`;
  }
  return "Paint not found";
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
    if (newLevel <= 10) {
      // Add to needToBuy if not already there
      const existingQuery = query(needToBuyCollection, where("name", "==", foundPaint.name));
      const existingSnapshot = await getDocs(existingQuery);

      if (existingSnapshot.empty) {
        await addDoc(needToBuyCollection, {
          brand: foundPaint.brand,
          type: foundPaint.type,
          name: foundPaint.name,
          createdAt: new Date().toISOString()
        });
      }
    } else {
      // Remove from needToBuy if level is now above 10
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

export const updateSprayPaintStatus = async (searchTerm, isSprayPaint) => {
  const foundPaint = await findPaintName(searchTerm);
  const userId = getCurrentUserId();

  if (foundPaint) {
    await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
      sprayPaint: isSprayPaint
    });
    return `${foundPaint.name} spray paint status updated to: ${isSprayPaint ? 'Spray Paint' : 'Regular Paint'}`;
  }
  return "Paint not found";
};

// =====================================
// DELETING PAINTS
// =====================================

export const deletePaint = async (searchTerm) => {
  const foundPaint = await findPaintName(searchTerm);
  const userId = getCurrentUserId();
  const needToBuyCollection = getUserNeedToBuyCollection();

  if (foundPaint) {
    // Delete from paints collection
    await deleteDoc(doc(db, 'users', userId, 'paints', foundPaint.id));

    // Also remove from needToBuy collection if it exists there
    const needToBuyQuery = query(needToBuyCollection, where("name", "==", searchTerm));
    const needToBuySnapshot = await getDocs(needToBuyQuery);

    needToBuySnapshot.forEach(async (docSnap) => {
      await deleteDoc(docSnap.ref);
    });

    return "Paint deleted successfully";
  }
  return "Paint not found";
};

// =====================================
// CHECKING PAINT LEVELS
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

  paintsSnapshot.forEach((doc) => {
    const paint = doc.data();

    // Count by status
    if (paint.status === "collection") collectionPaints++;
    else if (paint.status === "wishlist") wishlistPaints++;
    else if (paint.status === "listed") listedPaints++;

    // Only count levels for collection paints
    if (paint.status === "collection") {
      if (paint.level <= 10) lowStockPaints++;
      if (paint.level === 0) emptyPaints++;
    }

    if (paint.sprayPaint) sprayPaints++;
    if (paint.airbrush) airbrushPaints++;
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
    airbrushPaints
  };
};

// =====================================
// BULK OPERATIONS
// =====================================

export const addMultiplePaints = async (paintsArray) => {
  const paintsCollection = getUserPaintsCollection();
  let addedCount = 0;

  for (const paint of paintsArray) {
    // Check if paint already exists
    const existing = await findPaintName(paint.name);
    if (!existing) {
      await addDoc(paintsCollection, {
        brand: paint.brand,
        airbrush: paint.airbrush,
        type: paint.type,
        name: paint.name,
        status: paint.status,
        level: paint.level,
        photoURL: paint.photoURL,
        sprayPaint: paint.sprayPaint || false,
        createdAt: new Date().toISOString()
      });
      addedCount++;
    }
  }

  return `${addedCount} paints added successfully`;
};

export const removeEmptyPaints = async () => {
  const paintsCollection = getUserPaintsCollection();
  const q = query(
    paintsCollection,
    where("level", "==", 0),
    where("status", "==", "collection")
  );
  const snapshot = await getDocs(q);

  let removedCount = 0;

  snapshot.forEach(async (docSnap) => {
    await deleteDoc(docSnap.ref);
    removedCount++;
  });

  return `${removedCount} empty paints removed`;
};