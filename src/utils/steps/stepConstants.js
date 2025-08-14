// utils/steps/stepConstants.js

// Paint technique options
export const PAINT_TECHNIQUES = [
  { value: 'brush', label: 'Brush' },
  { value: 'airbrush', label: 'Airbrush' },
  { value: 'drybrush', label: 'Dry Brush' },
  { value: 'wash', label: 'Wash' },
  { value: 'glaze', label: 'Glaze' },
  { value: 'stipple', label: 'Stipple' },
  { value: 'sponge', label: 'Sponge' },
  { value: 'layer', label: 'Layer' },
  { value: 'highlight', label: 'Highlight' },
  { value: 'shade', label: 'Shade' }
];

// Step validation limits
export const STEP_LIMITS = {
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  MAX_PAINTS_PER_STEP: 10,
  MAX_PHOTOS_PER_STEP: 10,
  MAX_NOTES_PER_STEP: 10
};

// Step status options
export const STEP_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped'
};

// Step section types for expansion tracking
export const STEP_SECTIONS = {
  COMPLETION: 'completion',
  PHOTOS: 'photos',
  PAINTS: 'paints',
  NOTES: 'notes',
  EDIT: 'edit'
};

// Default step data structure
export const DEFAULT_STEP = {
  id: null,
  title: '',
  description: '',
  order: 1,
  completed: false,
  completedAt: null,
  createdAt: null,
  updatedAt: null,
  projectId: null,
  paints: [],
  photos: [],
  notes: []
};

// Step editing states
export const EDIT_MODES = {
  NONE: 'none',
  TITLE: 'title',
  DESCRIPTION: 'description',
  FULL: 'full'
};

// Drag and drop types
export const DRAG_TYPES = {
  STEP: 'step',
  PAINT: 'paint',
  PHOTO: 'photo'
};

// Step action types for tracking
export const STEP_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  COMPLETE: 'complete',
  UNCOMPLETE: 'uncomplete',
  REORDER: 'reorder',
  ADD_PAINT: 'add_paint',
  REMOVE_PAINT: 'remove_paint',
  ADD_PHOTO: 'add_photo',
  REMOVE_PHOTO: 'remove_photo',
  ADD_NOTE: 'add_note',
  UPDATE_NOTE: 'update_note',
  DELETE_NOTE: 'delete_note'
};

// UI responsive breakpoints for step display
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280
};

// Animation durations (in milliseconds)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  DRAG_THRESHOLD: 100
};

// Error messages
export const ERROR_MESSAGES = {
  TITLE_REQUIRED: 'Step title is required',
  TITLE_TOO_LONG: `Step title must be less than ${STEP_LIMITS.TITLE_MAX_LENGTH} characters`,
  DESCRIPTION_TOO_LONG: `Step description must be less than ${STEP_LIMITS.DESCRIPTION_MAX_LENGTH} characters`,
  PAINT_LIMIT_REACHED: `Maximum ${STEP_LIMITS.MAX_PAINTS_PER_STEP} paints per step`,
  PHOTO_LIMIT_REACHED: `Maximum ${STEP_LIMITS.MAX_PHOTOS_PER_STEP} photos per step`,
  NOTE_LIMIT_REACHED: `Maximum ${STEP_LIMITS.MAX_NOTES_PER_STEP} notes per step`,
  UPDATE_FAILED: 'Failed to update step. Please try again.',
  DELETE_FAILED: 'Failed to delete step. Please try again.',
  REORDER_FAILED: 'Failed to reorder steps. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  STEP_CREATED: 'Step created successfully',
  STEP_UPDATED: 'Step updated successfully',
  STEP_DELETED: 'Step deleted successfully',
  STEP_COMPLETED: 'Step marked as complete',
  STEP_UNCOMPLETED: 'Step marked as incomplete',
  STEPS_REORDERED: 'Steps reordered successfully',
  PAINT_ASSIGNED: 'Paint assigned to step',
  PAINT_REMOVED: 'Paint removed from step',
  PHOTO_ASSIGNED: 'Photo assigned to step',
  PHOTO_REMOVED: 'Photo removed from step'
};

// Default form values
export const DEFAULT_FORMS = {
  STEP_EDIT: {
    title: '',
    description: ''
  },
  PAINT_ASSIGNMENT: {
    usage: '',
    technique: 'brush'
  }
};

// CSS class names for consistent styling
export const CSS_CLASSES = {
  STEP_CONTAINER: 'step-container',
  STEP_HEADER: 'step-header',
  STEP_CONTENT: 'step-content',
  STEP_EXPANDED: 'step-expanded',
  STEP_COLLAPSED: 'step-collapsed',
  STEP_COMPLETED: 'step-completed',
  STEP_PENDING: 'step-pending',
  DRAG_HANDLE: 'step-drag-handle',
  DRAG_PREVIEW: 'step-drag-preview'
};