// services/projects/sync/projectSync.js
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { getCurrentUserId, getUserProjectsCollection } from '../utils/projectHelpers.js';

export const syncExistingProjectPaintRelations = async () => {
  const userId = getCurrentUserId();
  const projectsCollection = getUserProjectsCollection();
  const projectsSnapshot = await getDocs(projectsCollection);

  let syncedCount = 0;

  for (const projectDocSnap of projectsSnapshot.docs) {
    const projectId = projectDocSnap.id;
    const projectData = projectDocSnap.data();
    const paintOverview = projectData.paintOverview || [];

    // For each paint in this project's overview
    for (const paintOverviewItem of paintOverview) {
      try {
        const paintDoc = doc(db, 'users', userId, 'paints', paintOverviewItem.paintId);
        const paintSnap = await getDoc(paintDoc);

        if (paintSnap.exists()) {
          const paintData = paintSnap.data();
          const currentProjects = paintData.projects || [];

          // Add project ID if not already there
          if (!currentProjects.includes(projectId)) {
            await updateDoc(paintDoc, {
              projects: [...currentProjects, projectId]
            });
            syncedCount++;
          }
        }
      } catch (error) {
        console.error(`Error syncing paint ${paintOverviewItem.paintId}:`, error);
      }
    }
  }

  return `Synced ${syncedCount} paint-project relationships`;
};

export const cleanupOrphanedPaintProjectRelations = async () => {
  const userId = getCurrentUserId();
  const paintsCollection = collection(db, 'users', userId, 'paints');
  const projectsCollection = getUserProjectsCollection();

  // Get all projects to check against
  const projectsSnapshot = await getDocs(projectsCollection);
  const validProjectIds = new Set();
  projectsSnapshot.forEach(doc => validProjectIds.add(doc.id));

  // Check all paints
  const paintsSnapshot = await getDocs(paintsCollection);
  let cleanedCount = 0;

  for (const paintDocSnap of paintsSnapshot.docs) {
    const paintData = paintDocSnap.data();
    const currentProjects = paintData.projects || [];

    // Filter out any project IDs that no longer exist
    const validProjects = currentProjects.filter(projectId =>
      validProjectIds.has(projectId)
    );

    // Update if there were orphaned relationships
    if (validProjects.length !== currentProjects.length) {
      await updateDoc(paintDocSnap.ref, {
        projects: validProjects
      });
      cleanedCount++;
    }
  }

  return `Cleaned up ${cleanedCount} paint documents with orphaned project references`;
};