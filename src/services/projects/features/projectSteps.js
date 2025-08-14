// services/projects/features/projectSteps.js
import {
  doc,
  updateDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { getCurrentUserId } from '../utils/projectHelpers.js';

export const addProjectStep = async (projectId, stepData) => {
  const userId = getCurrentUserId();
  const projectDoc = doc(db, 'users', userId, 'projects', projectId);
  const docSnap = await getDoc(projectDoc);

  if (!docSnap.exists()) {
    throw new Error("Project not found");
  }

  const projectData = docSnap.data();
  const currentSteps = projectData.steps || [];

  // Generate a unique ID for the step
  const stepWithId = {
    ...stepData,
    id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  await updateDoc(projectDoc, {
    steps: currentSteps.concat([stepWithId]),
    updatedAt: serverTimestamp()
  });

  return "Step added to project";
};

export const updateProjectStep = async (projectId, stepId, stepUpdates) => {
  const userId = getCurrentUserId();
  const projectDoc = doc(db, 'users', userId, 'projects', projectId);
  const docSnap = await getDoc(projectDoc);

  if (!docSnap.exists()) {
    throw new Error("Project not found");
  }

  const projectData = docSnap.data();
  const currentSteps = projectData.steps || [];
  const updatedSteps = currentSteps.map(step =>
    step.id === stepId ? { ...step, ...stepUpdates } : step
  );

  await updateDoc(projectDoc, {
    steps: updatedSteps,
    updatedAt: serverTimestamp()
  });

  return "Step updated";
};

export const deleteProjectStep = async (projectId, stepId) => {
  const userId = getCurrentUserId();
  const projectDoc = doc(db, 'users', userId, 'projects', projectId);
  const docSnap = await getDoc(projectDoc);

  if (!docSnap.exists()) {
    throw new Error("Project not found");
  }

  const projectData = docSnap.data();
  const currentSteps = projectData.steps || [];
  const updatedSteps = currentSteps.filter(step => step.id !== stepId);

  await updateDoc(projectDoc, {
    steps: updatedSteps,
    updatedAt: serverTimestamp()
  });

  return "Step deleted";
};

export const reorderProjectSteps = async (projectId, reorderedSteps) => {
  const userId = getCurrentUserId();
  const projectDoc = doc(db, 'users', userId, 'projects', projectId);

  await updateDoc(projectDoc, {
    steps: reorderedSteps,
    updatedAt: serverTimestamp()
  });

  return "Steps reordered";
};