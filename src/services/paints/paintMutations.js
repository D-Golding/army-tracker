// services/paints/paintMutations.js - All create, update and delete functions with project support and tier limits
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { auth } from '../../firebase.js';
import { findPaintName } from './paintQueries.js';

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

// Helper function to check tier limits
const checkPaintLimit = async () => {
  const userId = getCurrentUserId();

  // Get user's profile to check tier limits
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    throw new Error('User profile not found');
  }

  const userProfile = userDoc.data();
  const paintLimit = userProfile.limits?.paints || 25; // Default to free tier limit

  // Count current paints
  const paintsCollection = getUserPaintsCollection();
  const paintsSnapshot = await getDocs(paintsCollection);
  const currentPaintCount = paintsSnapshot.size;

  // Check if adding one more paint would exceed the limit
  if (currentPaintCount >= paintLimit) {
    const tierName = userProfile.subscription?.tier || 'free';
    throw new Error(`Paint limit reached! You can have up to ${paintLimit} paints on the ${tierName} tier. Upgrade your subscription to add more paints.`);
  }

  return {
    currentCount: currentPaintCount,
    limit: paintLimit,
    remaining: paintLimit - currentPaintCount
  };
};

// =====================================
// CORE PAINT MANAGEMENT FUNCTIONS
// =====================================

export const newPaint = async (brand, airbrush, type, name, status = "listed", level, photoURL = null, sprayPaint = false, colour) => {
  // Check tier limits before adding paint
  await checkPaintLimit();

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
    colour,
    projects: [], // Initialize empty projects array
    createdAt: new Date().toISOString()
  });
};

// =====================================
// PROJECT CONNECTION FUNCTIONS
// =====================================

export const addPaintToProject = async (paintName, projectId) => {
  const foundPaint = await findPaintName(paintName);
  const userId = getCurrentUserId();

  if (!foundPaint) {
    throw new Error("Paint not found");
  }

  // Add project to paint's projects array if not already there
  const currentProjects = foundPaint.projects || [];
  if (!currentProjects.includes(projectId)) {
    const updatedProjects = [...currentProjects, projectId];

    await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
      projects: updatedProjects
    });
  }

  return `${foundPaint.name} added to project`;
};

export const removePaintFromProject = async (paintName, projectId) => {
  const foundPaint = await findPaintName(paintName);
  const userId = getCurrentUserId();

  if (!foundPaint) {
    throw new Error("Paint not found");
  }

  // Remove project from paint's projects array
  const currentProjects = foundPaint.projects || [];
  const updatedProjects = currentProjects.filter(id => id !== projectId);

  await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
    projects: updatedProjects
  });

  return `${foundPaint.name} removed from project`;
};

export const updatePaintProjects = async (paintName, projectIds) => {
  const foundPaint = await findPaintName(paintName);
  const userId = getCurrentUserId();

  if (!foundPaint) {
    throw new Error("Paint not found");
  }

  await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
    projects: projectIds || []
  });

  return `${foundPaint.name} projects updated`;
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

export const updatePaintColour = async (searchTerm, newColour) => {
  const foundPaint = await findPaintName(searchTerm);
  const userId = getCurrentUserId();

  if (foundPaint) {
    const oldColour = foundPaint.colour;
    await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
      colour: newColour
    });
    return `${foundPaint.name} colour updated from ${oldColour} to ${newColour}`;
  }
  return "Paint not found";
};

export const updatePaintPhoto = async (searchTerm, newPhotoURL) => {
  const foundPaint = await findPaintName(searchTerm);
  const userId = getCurrentUserId();

  if (foundPaint) {
    const oldPhoto = foundPaint.photoURL;
    await updateDoc(doc(db, 'users', userId, 'paints', foundPaint.id), {
      photoURL: newPhotoURL
    });
    return `${foundPaint.name} photo updated from ${oldPhoto} to ${newPhotoURL}`;
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
// BULK OPERATIONS
// =====================================

export const addMultiplePaints = async (paintsArray) => {
  // Check if adding all these paints would exceed the limit
  const userId = getCurrentUserId();

  // Get user's profile to check tier limits
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    throw new Error('User profile not found');
  }

  const userProfile = userDoc.data();
  const paintLimit = userProfile.limits?.paints || 25;

  // Count current paints
  const paintsCollection = getUserPaintsCollection();
  const paintsSnapshot = await getDocs(paintsCollection);
  const currentPaintCount = paintsSnapshot.size;

  // Check if adding all paints would exceed limit
  if (currentPaintCount + paintsArray.length > paintLimit) {
    const tierName = userProfile.subscription?.tier || 'free';
    throw new Error(`Cannot add ${paintsArray.length} paints. You have ${currentPaintCount}/${paintLimit} paints on the ${tierName} tier. Upgrade to add more paints.`);
  }

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
        colour: paint.colour,
        projects: paint.projects || [], // Initialize projects array
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