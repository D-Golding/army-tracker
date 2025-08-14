// hooks/useStepFormData.js - Form data management
import { useState } from 'react';

export const useStepFormData = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    paints: [],
    photos: [],
    notes: []
  });

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Paint handlers
  const addPaint = (assignment) => {
    setFormData(prev => ({
      ...prev,
      paints: [...prev.paints, assignment]
    }));
  };

  const removePaint = (paintId) => {
    setFormData(prev => ({
      ...prev,
      paints: prev.paints.filter(p => p.paintId !== paintId)
    }));
  };

  const updatePaint = (paintId, updates) => {
    setFormData(prev => ({
      ...prev,
      paints: prev.paints.map(paint =>
        paint.paintId === paintId ? { ...paint, ...updates } : paint
      )
    }));
  };

  // Photo handlers
  const addPhotos = (photoUrls) => {
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...photoUrls]
    }));
  };

  const removePhoto = (photoUrl) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(url => url !== photoUrl)
    }));
  };

  // Note handlers
  const addNote = (noteData) => {
    setFormData(prev => ({
      ...prev,
      notes: [...prev.notes, noteData]
    }));
  };

  const updateNote = (noteId, updates) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === noteId ? { ...note, ...updates } : note
      )
    }));
  };

  const removeNote = (noteId) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes.filter(note => note.id !== noteId)
    }));
  };

  return {
    formData,
    updateField,
    addPaint,
    removePaint,
    updatePaint,
    addPhotos,
    removePhoto,
    addNote,
    updateNote,
    removeNote
  };
};