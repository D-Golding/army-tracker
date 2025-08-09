// services/projectService.js - Updated with Difficulty Support
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { auth } from '../firebase.js';
import { findPaintName } from './paintService.js';

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.uid;
};

// Helper function to get user's projects collection reference
const getUserProjectsCollection = () => {
  const userId = getCurrentUserId();
  return collection(db, 'users', userId, 'projects');
};

// =====================================
// PROJECT MANAGEMENT FUNCTIONS
// =====================================

export const createProject = async (
  projectName,
  requiredPaints,
  description = "",
  photoURLs = [],
  status = "upcoming",
  difficulty = "beginner"
) => {
  const projectsCollection = getUserProjectsCollection();

  const projectData = {
    name: projectName,
    description,
    requiredPaints,
    photoURLs,
    status,
    difficulty, // Add difficulty field
    created: serverTimestamp(),
    updatedAt: serverTimestamp(),

    // Initialize new project structure
    paintOverview: [],
    steps: [],

    // Gamification fields (for future use)
    completedAt: null,
    complexityScore: null
  };

  const docRef = await addDoc(projectsCollection, projectData);

  return {
    id: docRef.id,
    message: `Project "${projectName}" created with status: ${status} and difficulty: ${difficulty}`
  };
};

export const getAllProjects = async () => {
  const projectsCollection = getUserProjectsCollection();
  const snapshot = await getDocs(projectsCollection);

  const results = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    results.push({
      id: doc.id,
      ...data,
      // Ensure difficulty exists with fallback
      difficulty: data.difficulty || 'beginner'
    });
  });
  return results;
};

export const findProjectByName = async (projectName) => {
  const projectsCollection = getUserProjectsCollection();
  const q = query(projectsCollection, where("name", "==", projectName));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      // Ensure difficulty exists with fallback
      difficulty: data.difficulty || 'beginner'
    };
  }
  return null;
};

export const findProjectById = async (projectId) => {
  const userId = getCurrentUserId();
  const projectDoc = doc(db, 'users', userId, 'projects', projectId);
  const docSnap = await getDoc(projectDoc);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      // Ensure difficulty exists with fallback
      difficulty: data.difficulty || 'beginner'
    };
  }
  return null;
};

// New function to update project difficulty
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

// Updated function to handle project completion with gamification data
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

  // Add completion timestamp when marking as completed
  if (newStatus.toLowerCase() === 'completed' && oldStatus !== 'completed') {
    updateData.completedAt = serverTimestamp();
  }

  // Remove completion timestamp when unmarking as completed
  if (newStatus.toLowerCase() !== 'completed' && oldStatus === 'completed') {
    updateData.completedAt = null;
  }

  await updateDoc(doc(db, 'users', userId, 'projects', project.id), updateData);

  return `Project "${projectName}" status updated from ${oldStatus} to ${newStatus}`;
};

export const checkProjectPaints = async (projectName) => {
  const project = await findProjectByName(projectName);

  if (!project) {
    return "Project not found";
  }

  const paintStatus = [];
  for (const paintName of project.requiredPaints) {
    const foundPaint = await findPaintName(paintName);

    if (!foundPaint) {
      paintStatus.push({
        name: paintName,
        status: "NOT IN INVENTORY",
        available: false,
        level: 0
      });
    } else {
      const isAvailable = foundPaint.status === "collection" && foundPaint.level > 0;
      paintStatus.push({
        name: foundPaint.name,
        brand: foundPaint.brand,
        type: foundPaint.type,
        status: isAvailable ? "AVAILABLE" : "UNAVAILABLE",
        available: isAvailable,
        level: foundPaint.level,
        paintStatus: foundPaint.status
      });
    }
  }

  return {
    projectName: project.name,
    paints: paintStatus,
    allPaintsAvailable: paintStatus.every(paint => paint.available && paint.level > 0)
  };
};

export const addProjectPhotos = async (projectName, newPhotoURLs) => {
  const project = await findProjectByName(projectName);

  if (!project) {
    throw new Error("Project not found");
  }

  const userId = getCurrentUserId();
  const currentPhotos = project.photoURLs || [];

  await updateDoc(doc(db, 'users', userId, 'projects', project.id), {
    photoURLs: currentPhotos.concat(newPhotoURLs),
    updatedAt: serverTimestamp()
  });

  return `${newPhotoURLs.length} photos added to project "${projectName}"`;
};

export const addProjectPhotosById = async (projectId, newPhotoURLs) => {
  const userId = getCurrentUserId();
  const projectDoc = doc(db, 'users', userId, 'projects', projectId);
  const docSnap = await getDoc(projectDoc);

  if (!docSnap.exists()) {
    throw new Error("Project not found");
  }

  const projectData = docSnap.data();
  const currentPhotos = projectData.photoURLs || [];

  await updateDoc(projectDoc, {
    photoURLs: currentPhotos.concat(newPhotoURLs),
    updatedAt: serverTimestamp()
  });

  return `${newPhotoURLs.length} photos added to project`;
};

export const addPaintsToProject = async (projectId, paintsToAdd) => {
  const userId = getCurrentUserId();
  const projectDoc = doc(db, 'users', userId, 'projects', projectId);
  const docSnap = await getDoc(projectDoc);

  if (!docSnap.exists()) {
    throw new Error("Project not found");
  }

  const projectData = docSnap.data();
  const currentPaintOverview = projectData.paintOverview || [];

  await updateDoc(projectDoc, {
    paintOverview: currentPaintOverview.concat(paintsToAdd),
    updatedAt: serverTimestamp()
  });

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

  await updateDoc(projectDoc, {
    paintOverview: updatedPaintOverview,
    steps: updatedSteps,
    updatedAt: serverTimestamp()
  });

  return "Paint removed from project and all step assignments";
};

export const addProjectStep = async (projectId, stepData) => {
  const userId = getCurrentUserId();
  const projectDoc = doc(db, 'users', userId, 'projects', projectId);
  const docSnap = await getDoc(projectDoc);

  if (!docSnap.exists()) {
    throw new Error("Project not found");
  }

  const projectData = docSnap.data();
  const currentSteps = projectData.steps || [];

  await updateDoc(projectDoc, {
    steps: currentSteps.concat([stepData]),
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

export const removeProjectPhoto = async (projectName, photoURL) => {
  const project = await findProjectByName(projectName);

  if (!project) {
    throw new Error("Project not found");
  }

  const userId = getCurrentUserId();
  const currentPhotos = project.photoURLs || [];
  const updatedPhotos = currentPhotos.filter(url => url !== photoURL);

  await updateDoc(doc(db, 'users', userId, 'projects', project.id), {
    photoURLs: updatedPhotos,
    updatedAt: serverTimestamp()
  });

  return currentPhotos.length > updatedPhotos.length ?
    "Photo removed successfully" : "Photo not found in project";
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

export const getProjectsByStatus = async (status) => {
  const validStatuses = ["upcoming", "started", "completed"];

  if (!validStatuses.includes(status.toLowerCase())) {
    return [];
  }

  const projectsCollection = getUserProjectsCollection();
  const q = query(projectsCollection, where("status", "==", status.toLowerCase()));
  const snapshot = await getDocs(q);

  const results = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    results.push({
      id: doc.id,
      ...data,
      // Ensure difficulty exists with fallback
      difficulty: data.difficulty || 'beginner'
    });
  });

  return results;
};

export const getActiveProjects = async () => {
  const upcomingProjects = await getProjectsByStatus("upcoming");
  const startedProjects = await getProjectsByStatus("started");

  return [...upcomingProjects, ...startedProjects];
};

export const getCompletedProjects = async () => {
  return await getProjectsByStatus("completed");
};

export const getProjectStatusSummary = async () => {
  const allProjects = await getAllProjects();

  let upcoming = 0;
  let started = 0;
  let completed = 0;

  allProjects.forEach((project) => {
    switch(project.status) {
      case "upcoming": upcoming++; break;
      case "started": started++; break;
      case "completed": completed++; break;
    }
  });

  return {
    total: allProjects.length,
    upcoming,
    started,
    completed,
    active: upcoming + started
  };
};

export const deleteProject = async (projectName) => {
  const project = await findProjectByName(projectName);

  if (!project) {
    throw new Error("Project not found");
  }

  const userId = getCurrentUserId();
  await deleteDoc(doc(db, 'users', userId, 'projects', project.id));

  return "Project deleted successfully";
};