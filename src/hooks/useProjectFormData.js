// hooks/useProjectFormData.js - Project wizard form data management - UPDATED with new fields and suggestion recording
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
    faction: '', // NEW FIELD
    unitName: '', // NEW FIELD
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
      customGame: '',
      faction: '', // Reset faction when manufacturer changes
      unitName: '' // Reset unit when manufacturer changes
    }));
  };

  // Handle game changes
  const updateGame = (game) => {
    setFormData(prev => ({
      ...prev,
      game,
      customGame: game === 'custom' ? prev.customGame : '',
      faction: '', // Reset faction when game changes
      unitName: '' // Reset unit when game changes
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

  // Format data for project creation - UPDATED with new fields and suggestion recording
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
      faction: (formData.faction || '').trim(), // NEW FIELD
      unitName: (formData.unitName || '').trim(), // NEW FIELD
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

    // DEBUG: Log what we're about to record
    console.log('🔍 DEBUG: About to record suggestions with data:', {
      manufacturer: projectData.manufacturer,
      game: projectData.game,
      faction: projectData.faction,
      unitName: projectData.unitName,
      hasDataToRecord: Boolean(projectData.manufacturer || projectData.game ||
                             projectData.faction || projectData.unitName)
    });

    // NEW: Auto-record suggestions for the database (async, non-blocking)
    setTimeout(async () => {
      try {
        console.log('🔍 DEBUG: setTimeout triggered, starting suggestion recording...');

        // Only record if we have meaningful data to record
        const hasDataToRecord = projectData.manufacturer || projectData.game ||
                               projectData.faction || projectData.unitName;

        console.log('🔍 DEBUG: hasDataToRecord:', hasDataToRecord);

        if (hasDataToRecord) {
          console.log('🔍 DEBUG: Importing suggestion recording function...');
          const { recordProjectCreationSuggestions } = await import('../services/suggestions/index.js');

          console.log('🔍 DEBUG: Calling recordProjectCreationSuggestions...');
          const result = await recordProjectCreationSuggestions(projectData);

          console.log('🔍 DEBUG: Recording result:', result);

          if (result.recorded !== false) {
            console.log(`📝 Project creation suggestions recorded: ${result.successful}/${result.total} successful`);
          }
        } else {
          console.log('🔍 DEBUG: No data to record, skipping suggestion recording');
        }
      } catch (error) {
        console.error('🔍 DEBUG: Error recording project suggestions (non-blocking):', error);
        // Don't fail project creation if suggestion recording fails
      }
    }, 1000); // Delay to not block project creation

    return projectData;
  };

  // Reset form to initial state - UPDATED with new fields
  const resetForm = () => {
    setFormData({
      name: '',
      difficulty: 'beginner',
      manufacturer: '',
      customManufacturer: '',
      game: '',
      customGame: '',
      faction: '', // NEW FIELD
      unitName: '', // NEW FIELD
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

  // NEW: Get suggestion context (for debugging)
  const getSuggestionContext = () => {
    const finalManufacturer = formData.manufacturer === 'custom'
      ? formData.customManufacturer
      : formData.manufacturer;

    const finalGame = formData.game === 'custom'
      ? formData.customGame
      : formData.game;

    return {
      manufacturer: finalManufacturer,
      game: finalGame,
      faction: formData.faction,
      unitName: formData.unitName,
      canUseFactionSuggestions: Boolean(finalManufacturer && finalGame),
      canUseUnitSuggestions: Boolean(finalManufacturer && finalGame && formData.faction)
    };
  };

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
    isRequiredFieldsValid,
    getSuggestionContext // NEW: For debugging suggestion context
  };
};