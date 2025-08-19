// hooks/useProjectFormData.js - Project wizard form data management - FIXED
import { useState } from 'react';

export const useProjectFormData = () => {
  const [formData, setFormData] = useState({
    // Required fields
    name: '',
    difficulty: 'beginner',

    // Optional fields
    manufacturer: '',
    customManufacturer: '',
    game: '',
    customGame: '',
    description: '',

    // Wizard-specific data
    selectedPaints: [],
    uploadedPhotos: [],
    coverPhotoURL: null
  });

  // Update a single field
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle manufacturer changes with reset logic
  const updateManufacturer = (manufacturer) => {
    setFormData(prev => ({
      ...prev,
      manufacturer,
      customManufacturer: manufacturer === 'custom' ? prev.customManufacturer : '',
      game: '', // Reset game when manufacturer changes
      customGame: ''
    }));
  };

  // Handle game changes
  const updateGame = (game) => {
    setFormData(prev => ({
      ...prev,
      game,
      customGame: game === 'custom' ? prev.customGame : ''
    }));
  };

  // Paint handlers
  const addPaints = (paints) => {
    setFormData(prev => ({
      ...prev,
      selectedPaints: [...prev.selectedPaints, ...paints]
    }));
  };

  const removePaint = (paintId) => {
    setFormData(prev => ({
      ...prev,
      selectedPaints: prev.selectedPaints.filter(p => p.id !== paintId)
    }));
  };

  const clearPaints = () => {
    setFormData(prev => ({
      ...prev,
      selectedPaints: []
    }));
  };

  // Photo handlers
  const addPhotos = (photos) => {
    setFormData(prev => ({
      ...prev,
      uploadedPhotos: [...prev.uploadedPhotos, ...photos]
    }));
  };

  const removePhoto = (photoURL) => {
    setFormData(prev => {
      const updatedPhotos = prev.uploadedPhotos.filter(url => url !== photoURL);
      const updatedCover = prev.coverPhotoURL === photoURL ? null : prev.coverPhotoURL;

      return {
        ...prev,
        uploadedPhotos: updatedPhotos,
        coverPhotoURL: updatedCover
      };
    });
  };

  const setCoverPhoto = (photoURL) => {
    setFormData(prev => ({
      ...prev,
      coverPhotoURL: photoURL
    }));
  };

  const clearPhotos = () => {
    setFormData(prev => ({
      ...prev,
      uploadedPhotos: [],
      coverPhotoURL: null
    }));
  };

  // Format data for project creation - FIXED VERSION
  const getProjectData = () => {
    // Determine final manufacturer and game values - with null checks
    const finalManufacturer = formData.manufacturer === 'custom'
      ? (formData.customManufacturer || '').trim()
      : (formData.manufacturer || '');

    const finalGame = formData.game === 'custom'
      ? (formData.customGame || '').trim()
      : (formData.game || '');

    // Ensure all fields have valid values (no undefined)
    const projectData = {
      name: (formData.name || '').trim(),
      manufacturer: finalManufacturer,
      game: finalGame,
      description: (formData.description || '').trim(),
      difficulty: formData.difficulty || 'beginner',
      status: 'upcoming',

      // Initialize arrays for project structure
      requiredPaints: [],
      photoURLs: formData.uploadedPhotos || [],
      coverPhotoURL: formData.coverPhotoURL || null,

      // Paint overview from wizard selections
      paintOverview: (formData.selectedPaints || []).map(paint => ({
        paintId: paint.id,
        paintName: paint.name,
        brand: paint.brand,
        type: paint.type,
        status: paint.status,
        addedToProject: new Date().toISOString(),
        totalUsageSteps: 0
      })),

      // Initialize empty arrays
      steps: [],
      notes: [],

      // Timestamps in European format for display, ISO for storage
      created: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Remove any undefined values (Firestore doesn't like them)
    Object.keys(projectData).forEach(key => {
      if (projectData[key] === undefined) {
        delete projectData[key];
      }
    });

    return projectData;
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      difficulty: 'beginner',
      manufacturer: '',
      customManufacturer: '',
      game: '',
      customGame: '',
      description: '',
      selectedPaints: [],
      uploadedPhotos: [],
      coverPhotoURL: null
    });
  };

  // Validation helpers
  const isValidName = () => formData.name?.trim().length > 0;
  const isValidDifficulty = () => formData.difficulty?.length > 0;
  const isRequiredFieldsValid = () => isValidName() && isValidDifficulty();

  return {
    formData,
    updateField,
    updateManufacturer,
    updateGame,
    addPaints,
    removePaint,
    clearPaints,
    addPhotos,
    removePhoto,
    setCoverPhoto,
    clearPhotos,
    getProjectData,
    resetForm,
    isValidName,
    isValidDifficulty,
    isRequiredFieldsValid
  };
};