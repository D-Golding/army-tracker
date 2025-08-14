// services/projects/features/projectPaints.js
import {
  doc,
  updateDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { getCurrentUserId } from '../utils/projectHelpers.js';

export const addPaintsToProject = async (projectId, paintsToAdd) => {
  const userId = getCurrentUserId();
  const projectDoc = doc(db, 'users', userId, 'projects', projectId);
  const docSnap = await getDoc(projectDoc);

  if (!docSnap.exists()) {
    throw new Error("Project not found");
  }

  const projectData = docSnap.data();
  const currentPaintOverview = projectData.paintOverview || [];

  // Update project document
  await updateDoc(projectDoc, {
    paintOverview: currentPaintOverview.concat(paintsToAdd),
    updatedAt: serverTimestamp()
  });

  // Update each paint document to include this project
  for (const paintToAdd of paintsToAdd) {
    try {
      const paintDoc = doc(db, 'users', userId, 'paints', paintToAdd.paintId);
      const paintSnap = await getDoc(paintDoc);

      if (paintSnap.exists()) {
        const paintData = paintSnap.data();
        const currentProjects = paintData.projects || [];

        // Add project ID if not already there
        if (!currentProjects.includes(projectId)) {
          await updateDoc(paintDoc, {
            projects: [...currentProjects, projectId]
          });
        }
      }
    } catch (error) {
      console.error(`Error updating paint ${paintToAdd.paintId}:`, error);
      // Continue with other paints even if one fails
    }
  }

  return `${paintsToAdd.length} paints added to project`;
};

export const removePaintFromProject = async (projectId, paintId) => {
  const userId = getCurrentUserId();
  const projectDoc = doc(db, 'users', userId, 'projects', projectId);
  const docSnap = await getDoc(projectDoc);

  if (!docSnap.exists()) {
    throw new Error("Project not found");
  }

  const projectData = docSnap.data();
  const currentPaintOverview = projectData.paintOverview || [];
  const updatedPaintOverview = currentPaintOverview.filter(paint => paint.paintId !== paintId);

  // Also remove the paint from any step assignments
  const updatedSteps = (projectData.steps || []).map(step => ({
    ...step,
    paints: (step.paints || []).filter(stepPaint => stepPaint.paintId !== paintId)
  }));

  // Update project document
  await updateDoc(projectDoc, {
    paintOverview: updatedPaintOverview,
    steps: updatedSteps,
    updatedAt: serverTimestamp()
  });

  // Update paint document to remove this project
  try {
    const paintDoc = doc(db, 'users', userId, 'paints', paintId);
    const paintSnap = await getDoc(paintDoc);

    if (paintSnap.exists()) {
      const paintData = paintSnap.data();
      const currentProjects = paintData.projects || [];
      const updatedProjects = currentProjects.filter(id => id !== projectId);

      await updateDoc(paintDoc, {
        projects: updatedProjects
      });
    }
  } catch (error) {
    console.error(`Error updating paint ${paintId}:`, error);
    // Don't fail the whole operation if paint update fails
  }

  return "Paint removed from project and all step assignments";
};