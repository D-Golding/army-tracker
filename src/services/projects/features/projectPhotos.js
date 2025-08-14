// services/projects/features/projectPhotos.js - Add metadata updating
import {
  doc,
  updateDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../firebase.js';
import { getCurrentUserId } from '../utils/projectHelpers.js';
import { findProjectByName } from '../core/projectQueries.js';

export const addProjectPhotos = async (projectName, newPhotoURLs) => {
  const project = await findProjectByName(projectName);

  if (!project) {
    throw new Error("Project not found");
  }

  const userId = getCurrentUserId();
  const currentPhotos = project.photos || [];

  // Convert URLs to photo objects if they're just strings (backwards compatibility)
  const newPhotoObjects = newPhotoURLs.map(urlOrObject => {
    if (typeof urlOrObject === 'string') {
      return {
        url: urlOrObject,
        title: '',
        description: '',
        originalFileName: '',
        uploadedAt: new Date().toISOString(),
        wasEdited: false
      };
    }
    return {
      ...urlOrObject,
      uploadedAt: urlOrObject.uploadedAt || new Date().toISOString()
    };
  });

  await updateDoc(doc(db, 'users', userId, 'projects', project.id), {
    photos: currentPhotos.concat(newPhotoObjects),
    // Keep photoURLs for backwards compatibility during transition
    photoURLs: (project.photoURLs || []).concat(newPhotoObjects.map(p => p.url)),
    updatedAt: serverTimestamp()
  });

  return `${newPhotoObjects.length} photos added to project "${projectName}"`;
};

export const addProjectPhotosById = async (projectId, newPhotoData) => {
  const userId = getCurrentUserId();
  const projectDoc = doc(db, 'users', userId, 'projects', projectId);
  const docSnap = await getDoc(projectDoc);

  if (!docSnap.exists()) {
    throw new Error("Project not found");
  }

  const projectData = docSnap.data();
  const currentPhotos = projectData.photos || [];

  // Convert to photo objects if needed
  const newPhotoObjects = newPhotoData.map(photoData => {
    if (typeof photoData === 'string') {
      return {
        url: photoData,
        title: '',
        description: '',
        originalFileName: '',
        uploadedAt: new Date().toISOString(),
        wasEdited: false
      };
    }
    return {
      ...photoData,
      uploadedAt: photoData.uploadedAt || new Date().toISOString()
    };
  });

  await updateDoc(projectDoc, {
    photos: currentPhotos.concat(newPhotoObjects),
    // Keep photoURLs for backwards compatibility during transition
    photoURLs: (projectData.photoURLs || []).concat(newPhotoObjects.map(p => p.url)),
    updatedAt: serverTimestamp()
  });

  return `${newPhotoObjects.length} photos added to project`;
};

export const removeProjectPhotoById = async (projectId, photoURL) => {
  const userId = getCurrentUserId();
  const projectDoc = doc(db, 'users', userId, 'projects', projectId);
  const docSnap = await getDoc(projectDoc);

  if (!docSnap.exists()) {
    throw new Error("Project not found");
  }

  const projectData = docSnap.data();
  const currentPhotos = projectData.photos || [];
  const currentPhotoURLs = projectData.photoURLs || [];

  // Remove from both photos array and photoURLs array
  const updatedPhotos = currentPhotos.filter(photo => photo.url !== photoURL);
  const updatedPhotoURLs = currentPhotoURLs.filter(url => url !== photoURL);

  await updateDoc(projectDoc, {
    photos: updatedPhotos,
    photoURLs: updatedPhotoURLs,
    updatedAt: serverTimestamp()
  });

  return currentPhotos.length > updatedPhotos.length ?
    "Photo removed successfully" : "Photo not found in project";
};

export const removeProjectPhoto = async (projectName, photoURL) => {
  const project = await findProjectByName(projectName);

  if (!project) {
    throw new Error("Project not found");
  }

  const userId = getCurrentUserId();
  const currentPhotos = project.photos || [];
  const currentPhotoURLs = project.photoURLs || [];

  // Remove from both photos array and photoURLs array
  const updatedPhotos = currentPhotos.filter(photo => photo.url !== photoURL);
  const updatedPhotoURLs = currentPhotoURLs.filter(url => url !== photoURL);

  await updateDoc(doc(db, 'users', userId, 'projects', project.id), {
    photos: updatedPhotos,
    photoURLs: updatedPhotoURLs,
    updatedAt: serverTimestamp()
  });

  return currentPhotos.length > updatedPhotos.length ?
    "Photo removed successfully" : "Photo not found in project";
};

// NEW FUNCTION: Update photo metadata
export const updateProjectPhotoMetadata = async (projectId, photoURL, metadataUpdates) => {
  const userId = getCurrentUserId();
  const projectDoc = doc(db, 'users', userId, 'projects', projectId);
  const docSnap = await getDoc(projectDoc);

  if (!docSnap.exists()) {
    throw new Error("Project not found");
  }

  const projectData = docSnap.data();
  const currentPhotos = projectData.photos || [];

  // Find and update the specific photo
  const updatedPhotos = currentPhotos.map(photo => {
    if (photo.url === photoURL) {
      return {
        ...photo,
        ...metadataUpdates,
        updatedAt: new Date().toISOString()
      };
    }
    return photo;
  });

  // Check if photo was found and updated
  const photoFound = updatedPhotos.some(photo =>
    photo.url === photoURL && (photo.title !== currentPhotos.find(p => p.url === photoURL)?.title ||
    photo.description !== currentPhotos.find(p => p.url === photoURL)?.description)
  );

  if (!photoFound) {
    throw new Error("Photo not found in project");
  }

  await updateDoc(projectDoc, {
    photos: updatedPhotos,
    updatedAt: serverTimestamp()
  });

  return "Photo metadata updated successfully";
};

// UPDATED function for cover photo functionality
export const updateProjectCoverPhoto = async (projectId, coverPhotoURL) => {
  const userId = getCurrentUserId();
  const projectDoc = doc(db, 'users', userId, 'projects', projectId);
  const docSnap = await getDoc(projectDoc);

  if (!docSnap.exists()) {
    throw new Error("Project not found");
  }

  const projectData = docSnap.data();
  const currentPhotos = projectData.photos || [];
  const currentPhotoURLs = projectData.photoURLs || [];

  // Prepare the update data
  const updateData = {
    coverPhotoURL: coverPhotoURL,
    updatedAt: serverTimestamp()
  };

  // If setting a cover photo, rearrange both photos and photoURLs arrays
  if (coverPhotoURL) {
    // Rearrange photos array
    const coverPhoto = currentPhotos.find(photo => photo.url === coverPhotoURL);
    const otherPhotos = currentPhotos.filter(photo => photo.url !== coverPhotoURL);
    if (coverPhoto) {
      updateData.photos = [coverPhoto, ...otherPhotos];
    }

    // Rearrange photoURLs array for backwards compatibility
    if (currentPhotoURLs.includes(coverPhotoURL)) {
      const otherURLs = currentPhotoURLs.filter(url => url !== coverPhotoURL);
      updateData.photoURLs = [coverPhotoURL, ...otherURLs];
    }
  }

  await updateDoc(projectDoc, updateData);

  return coverPhotoURL ? "Cover photo set successfully" : "Cover photo removed successfully";
};