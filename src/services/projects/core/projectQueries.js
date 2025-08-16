// services/projects/core/projectQueries.js - Handle new photo structure with pagination
import {
  getDocs,
  doc,
  query,
  where,
  getDoc,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { getCurrentUserId, getUserProjectsCollection } from '../../shared/userHelpers.js';
import { DEFAULTS } from '../../shared/constants.js';
import { getAllProjects, deleteProjectById } from './projectCore.js';
import { findPaintName } from '../../paints/index.js';

// Helper function to ensure backwards compatibility with photo structure
const normalizeProjectPhotos = (projectData) => {
  // Ensure backwards compatibility - if no photos array but photoURLs exist, convert them
  let photos = projectData.photos;
  if (!photos && projectData.photoURLs) {
    photos = projectData.photoURLs.map(url => ({
      url: url,
      title: '',
      description: '',
      originalFileName: '',
      uploadedAt: '',
      wasEdited: false
    }));
  }

  return {
    ...projectData,
    photos: photos || [],
    difficulty: projectData.difficulty || DEFAULTS.PROJECT_DIFFICULTY
  };
};

// =====================================
// PAGINATED QUERIES - NEW
// =====================================

export const getProjectsPaginated = async (pageSize = 5, lastDoc = null, filters = {}) => {
  const projectsCollection = getUserProjectsCollection();

  // Start with base query - always order by created desc for consistency
  let q = query(projectsCollection, orderBy('created', 'desc'));

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
    const data = doc.data();
    results.push({
      id: doc.id,
      ...normalizeProjectPhotos(data)
    });
  });

  // Return both results and last document for next page
  return {
    projects: results,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: results.length === pageSize
  };
};

export const getProjectsByStatusPaginated = async (status, pageSize = 5, lastDoc = null) => {
  return await getProjectsPaginated(pageSize, lastDoc, { status });
};

// =====================================
// EXISTING FUNCTIONS - NON-PAGINATED
// =====================================

export const findProjectByName = async (projectName) => {
  const projectsCollection = getUserProjectsCollection();
  const q = query(projectsCollection, where("name", "==", projectName));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...normalizeProjectPhotos(data)
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
      ...normalizeProjectPhotos(data)
    };
  }
  return null;
};

// Complex delete operation that requires finding by name first
export const deleteProject = async (projectName) => {
  const project = await findProjectByName(projectName);

  if (!project) {
    throw new Error("Project not found");
  }

  return await deleteProjectById(project.id);
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
      ...normalizeProjectPhotos(data)
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