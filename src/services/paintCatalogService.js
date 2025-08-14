// services/paintCatalogService.js
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase.js';

// =====================================
// PAINT CATALOG READ OPERATIONS
// =====================================

export const getAllCatalogPaints = async () => {
  const snapshot = await getDocs(collection(db, "paintCatalog"));

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });
  return results;
};

export const getCatalogBrands = async () => {
  const snapshot = await getDocs(collection(db, "paintCatalog"));

  const brands = new Set();
  snapshot.forEach((doc) => {
    brands.add(doc.data().brand);
  });

  return Array.from(brands).sort();
};

export const getCatalogTypesByBrand = async (brand) => {
  const q = query(collection(db, "paintCatalog"), where("brand", "==", brand));
  const snapshot = await getDocs(q);

  const types = new Set();
  snapshot.forEach((doc) => {
    types.add(doc.data().type);
  });

  return Array.from(types).sort();
};

export const getCatalogPaintsByBrandAndType = async (brand, type) => {
  const q = query(
    collection(db, "paintCatalog"),
    where("brand", "==", brand),
    where("type", "==", type)
  );
  const snapshot = await getDocs(q);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });

  // Sort by name
  return results.sort((a, b) => a.name.localeCompare(b.name));
};

export const getCatalogPaintsByBrand = async (brand) => {
  const q = query(collection(db, "paintCatalog"), where("brand", "==", brand));
  const snapshot = await getDocs(q);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });

  return results.sort((a, b) => a.name.localeCompare(b.name));
};

// =====================================
// ADMIN FUNCTIONS FOR CATALOG MANAGEMENT
// =====================================

export const addCatalogPaint = async (brand, type, name, airbrush = false, sprayPaint = false) => {
  // Check if paint already exists in catalog
  const existingQuery = query(
    collection(db, "paintCatalog"),
    where("brand", "==", brand),
    where("type", "==", type),
    where("name", "==", name)
  );
  const existingSnapshot = await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    throw new Error(`Paint "${name}" by "${brand}" (${type}) already exists in catalog`);
  }

  await addDoc(collection(db, "paintCatalog"), {
    brand,
    type,
    name,
    airbrush,
    sprayPaint,
    dateAdded: new Date().toISOString()
  });

  return `${name} added to paint catalog`;
};

export const bulkAddCatalogPaints = async (paintsArray) => {
  let addedCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (const paint of paintsArray) {
    try {
      // Check if paint already exists (brand + type + name combination)
      const existingQuery = query(
        collection(db, "paintCatalog"),
        where("brand", "==", paint.brand),
        where("type", "==", paint.type),
        where("name", "==", paint.name)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (existingSnapshot.empty) {
        await addDoc(collection(db, "paintCatalog"), {
          brand: paint.brand,
          type: paint.type,
          name: paint.name,
          colour: paint.colour,
          airbrush: paint.airbrush || false,
          sprayPaint: paint.sprayPaint || false,
          dateAdded: new Date().toISOString()
        });
        addedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      errors.push(`Error adding ${paint.name}: ${error.message}`);
    }
  }

  return {
    added: addedCount,
    skipped: skippedCount,
    errors
  };
};

// =====================================
// UTILITY FUNCTIONS
// =====================================

export const getCatalogSummary = async () => {
  const snapshot = await getDocs(collection(db, "paintCatalog"));

  let totalPaints = snapshot.size;
  let airbrushPaints = 0;
  let sprayPaints = 0;
  const brands = new Set();
  const types = new Set();

  snapshot.forEach((doc) => {
    const paint = doc.data();
    if (paint.airbrush) airbrushPaints++;
    if (paint.sprayPaint) sprayPaints++;
    brands.add(paint.brand);
    types.add(paint.type);
  });

  return {
    total: totalPaints,
    brands: brands.size,
    types: types.size,
    airbrush: airbrushPaints,
    sprayPaint: sprayPaints
  };
};