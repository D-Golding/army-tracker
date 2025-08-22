// utils/projectValidation.js - Updated validation with new fields
export const validateProjectForm = (formData) => {
  const errors = {};

  // Validate project name (ONLY REQUIRED FIELD)
  if (!formData.name?.trim()) {
    errors.name = 'Project name is required';
  }

  // Validate custom manufacturer if selected
  if (formData.manufacturer === 'custom' && !formData.customManufacturer?.trim()) {
    errors.manufacturer = 'Please enter a manufacturer name';
  }

  // Validate custom game if selected
  if (formData.game === 'custom' && !formData.customGame?.trim()) {
    errors.game = 'Please enter a game name';
  }

  // Note: manufacturer, game, faction, unitName, description and difficulty are all optional

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Utility to format project data for API
export const formatProjectData = (formData) => {
  // Determine final manufacturer and game values
  const finalManufacturer = formData.manufacturer === 'custom'
    ? formData.customManufacturer.trim()
    : formData.manufacturer;

  const finalGame = formData.game === 'custom'
    ? formData.customGame.trim()
    : formData.game;

  return {
    name: formData.name.trim(),
    manufacturer: finalManufacturer || '',
    game: finalGame || '',
    faction: formData.faction?.trim() || '',
    unitName: formData.unitName?.trim() || '',
    description: formData.description?.trim() || '',
    difficulty: formData.difficulty || 'beginner',
    status: 'upcoming',
    requiredPaints: [],
    photoURLs: [],
    created: new Date().toISOString()
  };
};

// Default form state - Updated with new fields
export const getDefaultFormState = () => ({
  name: '',
  manufacturer: '',
  customManufacturer: '',
  game: '',
  customGame: '',
  faction: '',
  unitName: '',
  description: '',
  difficulty: 'beginner'
});

// Difficulty options for dropdown
export const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner - Simple techniques' },
  { value: 'intermediate', label: 'Intermediate - Multiple techniques' },
  { value: 'advanced', label: 'Advanced - Complex techniques' },
  { value: 'expert', label: 'Expert - Master-level work' }
];