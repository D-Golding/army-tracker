// services/projects/core/projectCore.js - Handle new photo structure
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { getCurrentUserId, getUserProjectsCollection } from '../../shared/userHelpers.js';
import { DEFAULTS } from '../../shared/constants.js';

// UPDATED createProject to accept new data structure with photo metadata
export const createProject = async (projectData) => {
  const projectsCollection = getUserProjectsCollection();

  // Default cover image URL from shared constants
  const defaultCoverImage = DEFAULTS.PROJECT_COVER_IMAGE;

  // Handle photos - support both old URL format and new photo object format
  let photoObjects = [];
  let photoURLs = [];

  if (projectData.uploadedPhotos && projectData.uploadedPhotos.length > 0) {
    // New format: photos come from wizard with metadata
    photoObjects = projectData.uploadedPhotos.map(photo => {
      if (typeof photo === 'string') {
        // Convert URL to photo object for backwards compatibility
        return {
          url: photo,
          title: '',
          description: '',
          originalFileName: '',
          uploadedAt: new Date().toISOString(),
          wasEdited: false
        };
      }
      return {
        ...photo,
        uploadedAt: photo.uploadedAt || new Date().toISOString()
      };
    });
    photoURLs = photoObjects.map(p => p.url);
  } else if (projectData.photoURLs && projectData.photoURLs.length > 0) {
    // Legacy format: just URLs
    photoURLs = projectData.photoURLs;
    photoObjects = projectData.photoURLs.map(url => ({
      url: url,
      title: '',
      description: '',
      originalFileName: '',
      uploadedAt: new Date().toISOString(),
      wasEdited: false
    }));
  } else {
    // No photos provided, use default
    photoURLs = [defaultCoverImage];
    photoObjects = [{
      url: defaultCoverImage,
      title: 'Default Cover',
      description: '',
      originalFileName: 'default-project-cover.jpg',
      uploadedAt: new Date().toISOString(),
      wasEdited: false
    }];
  }

  // Build the project document
  const documentData = {
    name: projectData.name,
    manufacturer: projectData.manufacturer || '',
    game: projectData.game || '',
    description: projectData.description || '',
    status: projectData.status || DEFAULTS.PROJECT_STATUS,
    difficulty: projectData.difficulty || DEFAULTS.PROJECT_DIFFICULTY,
    created: serverTimestamp(),
    updatedAt: serverTimestamp(),

    // New photo structure with metadata
    photos: photoObjects,

    // Legacy photoURLs for backwards compatibility
    photoURLs: photoURLs,

    // Cover photo (first photo by default)
    coverPhotoURL: projectData.coverPhotoURL || photoURLs[0],

    // Initialize new project structure
    paintOverview: projectData.paintOverview || [],
    steps: [],

    // Legacy fields (for backwards compatibility)
    requiredPaints: projectData.requiredPaints || [],

    // Gamification fields (for future use)
    completedAt: null,
    complexityScore: null
  };

  const docRef = await addDoc(projectsCollection, documentData);

  return {
    id: docRef.id,
    message: `Project "${projectData.name}" created successfully`
  };
};

// Legacy createProject function (keeping for backwards compatibility if needed)
export const createProjectLegacy = async (
  projectName,
  requiredPaints,
  description = "",
  photoURLs = [],
  status = DEFAULTS.PROJECT_STATUS,
  difficulty = DEFAULTS.PROJECT_DIFFICULTY
) => {
  const projectsCollection = getUserProjectsCollection();

  // Convert legacy photoURLs to new photo objects
  const photoObjects = photoURLs.length > 0 ? photoURLs.map(url => ({
    url: url,
    title: '',
    description: '',
    originalFileName: '',
    uploadedAt: new Date().toISOString(),
    wasEdited: false
  })) : [{
    url: DEFAULTS.PROJECT_COVER_IMAGE,
    title: 'Default Cover',
    description: '',
    originalFileName: 'default-project-cover.jpg',
    uploadedAt: new Date().toISOString(),
    wasEdited: false
  }];

  const projectData = {
    name: projectName,
    description,
    requiredPaints,
    status,
    difficulty,
    created: serverTimestamp(),
    updatedAt: serverTimestamp(),

    // New photo structure
    photos: photoObjects,
    photoURLs: photoObjects.map(p => p.url), // Legacy compatibility
    coverPhotoURL: photoObjects[0].url,

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

    // Ensure backwards compatibility - if no photos array but photoURLs exist, convert them
    let photos = data.photos;
    if (!photos && data.photoURLs) {
      photos = data.photoURLs.map(url => ({
        url: url,
        title: '',
        description: '',
        originalFileName: '',
        uploadedAt: '',
        wasEdited: false
      }));
    }

    results.push({
      id: doc.id,
      ...data,
      photos: photos || [],
      difficulty: data.difficulty || DEFAULTS.PROJECT_DIFFICULTY
    });
  });
  return results;
};

// Simple delete by ID - no dependencies
export const deleteProjectById = async (projectId) => {
  const userId = getCurrentUserId();
  await deleteDoc(doc(db, 'users', userId, 'projects', projectId));
  return "Project deleted successfully";
};