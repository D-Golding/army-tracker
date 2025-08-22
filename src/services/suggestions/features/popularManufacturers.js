// services/suggestions/features/popularManufacturers.js
// Get popular manufacturers based on actual project usage

import { collection, getDocs, query, collectionGroup } from 'firebase/firestore';
import { db } from '../../../firebase.js';

// Configurable threshold - change this number to adjust when manufacturers appear as "popular"
const POPULAR_THRESHOLD = 3; // Manufacturer needs to be used in at least 3 projects

// Get popular manufacturers based on actual suggestion usage
export const getPopularManufacturers = async (topCount = 5) => {
  try {
    console.log('📊 Fetching popular manufacturers...');

    // Get all faction suggestions (each represents project usage)
    const factionsQuery = collectionGroup(db, 'factions');
    const snapshot = await getDocs(factionsQuery);

    // Count actual usage by manufacturer
    const manufacturerUsage = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data && data.manufacturer) {
        // Skip system/internal collection names
        if (data.manufacturer === 'global_manufacturers' || data.manufacturer === 'global') {
          return; // Skip this invalid manufacturer
        }

        // Convert normalized manufacturer back to display format
        const manufacturer = data.manufacturer;
        const usageCount = data.count || 1; // How many times this manufacturer was used

        manufacturerUsage[manufacturer] = (manufacturerUsage[manufacturer] || 0) + usageCount;
      }
    });

    // Filter by threshold and convert to array
    const popularManufacturers = Object.entries(manufacturerUsage)
      .filter(([manufacturer, count]) => {
        // Additional filtering to exclude system names
        if (manufacturer === 'global' || manufacturer === 'global_manufacturers') {
          return false;
        }
        return count >= POPULAR_THRESHOLD;
      })
      .map(([manufacturer, count]) => ({
        name: manufacturer,
        usageCount: count,
        // Convert normalized name back to display format
        displayName: manufacturer.split('_').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, topCount);

    console.log(`📊 Popular manufacturers (threshold: ${POPULAR_THRESHOLD}):`, popularManufacturers);
    return popularManufacturers;

  } catch (error) {
    console.error('Error fetching popular manufacturers:', error);
    return [];
  }
};

// Get popular manufacturers with caching
let cachedPopularManufacturers = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getPopularManufacturersCached = async (topCount = 5) => {
  const now = Date.now();

  // Return cached data if it's still fresh
  if (cachedPopularManufacturers && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('📊 Using cached popular manufacturers');
    return cachedPopularManufacturers;
  }

  // Fetch fresh data
  const popularManufacturers = await getPopularManufacturers(topCount);

  // Cache the results
  cachedPopularManufacturers = popularManufacturers;
  lastFetchTime = now;

  return popularManufacturers;
};

// Clear the cache (call when new suggestions are recorded)
export const clearPopularManufacturersCache = () => {
  cachedPopularManufacturers = null;
  lastFetchTime = 0;
  console.log('📊 Cleared popular manufacturers cache');
};

// Export the threshold for easy adjustment
export { POPULAR_THRESHOLD };