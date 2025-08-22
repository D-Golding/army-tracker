// services/projects/features/projectStatus.js
import {
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { getCurrentUserId } from '../utils/projectHelpers.js';
import { findProjectByName } from '../core/projectQueries.js';

// NEW: Update project title
export const updateProjectTitle = async (projectName, newTitle) => {
  if (!newTitle || !newTitle.trim()) {
    throw new Error("Project title cannot be empty");
  }

  const project = await findProjectByName(projectName);

  if (!project) {
    throw new Error("Project not found");
  }

  const userId = getCurrentUserId();
  await updateDoc(doc(db, 'users', userId, 'projects', project.id), {
    name: newTitle.trim(),
    updatedAt: serverTimestamp()
  });

  return `Project "${projectName}" title updated to "${newTitle.trim()}"`;
};

export const updateProjectDifficulty = async (projectName, newDifficulty) => {
  const validDifficulties = ["beginner", "intermediate", "advanced", "expert"];

  if (!validDifficulties.includes(newDifficulty.toLowerCase())) {
    throw new Error("Invalid difficulty. Use: beginner, intermediate, advanced, or expert");
  }

  const project = await findProjectByName(projectName);

  if (!project) {
    throw new Error("Project not found");
  }

  const userId = getCurrentUserId();
  await updateDoc(doc(db, 'users', userId, 'projects', project.id), {
    difficulty: newDifficulty.toLowerCase(),
    updatedAt: serverTimestamp()
  });

  return `Project "${projectName}" difficulty updated to ${newDifficulty}`;
};

export const updateProjectStatus = async (projectName, newStatus) => {
  const validStatuses = ["upcoming", "started", "completed"];

  if (!validStatuses.includes(newStatus.toLowerCase())) {
    throw new Error("Invalid status. Use: upcoming, started, or completed");
  }

  const project = await findProjectByName(projectName);

  if (!project) {
    throw new Error("Project not found");
  }

  const userId = getCurrentUserId();
  const oldStatus = project.status;

  const updateData = {
    status: newStatus.toLowerCase(),
    updatedAt: serverTimestamp()
  };

  if (newStatus.toLowerCase() === 'completed' && oldStatus !== 'completed') {
    updateData.completedAt = serverTimestamp();
  }

  if (newStatus.toLowerCase() !== 'completed' && oldStatus === 'completed') {
    updateData.completedAt = null;
  }

  await updateDoc(doc(db, 'users', userId, 'projects', project.id), updateData);

  return `Project "${projectName}" status updated from ${oldStatus} to ${newStatus}`;
};

export const updateProjectDescription = async (projectName, newDescription) => {
  const project = await findProjectByName(projectName);

  if (!project) {
    throw new Error("Project not found");
  }

  const userId = getCurrentUserId();
  await updateDoc(doc(db, 'users', userId, 'projects', project.id), {
    description: newDescription,
    updatedAt: serverTimestamp()
  });

  return `Project "${projectName}" description updated`;
};