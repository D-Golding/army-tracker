// config/achievementConfig.js - Dynamic Achievement System Configuration
// NO HARDCODING - All data driven and configurable

export const ACHIEVEMENT_CATEGORIES = {
  CREATE_PROJECT: 'create_project',
  PAINT_MASTER: 'paint_master',
  COMPLETIONIST: 'completionist',
  BRAND_EXPLORER: 'brand_explorer',
  TECHNIQUE_SPECIALIST: 'technique_specialist',
  STEP_MASTER: 'step_master',
  PHOTO_DOCUMENTARIAN: 'photo_documentarian'
};

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
};

export const DIFFICULTY_SCORING = {
  [DIFFICULTY_LEVELS.BEGINNER]: {
    minSteps: 1,
    maxSteps: 3,
    minPaints: 1,
    maxPaints: 5,
    basePoints: 10
  },
  [DIFFICULTY_LEVELS.INTERMEDIATE]: {
    minSteps: 4,
    maxSteps: 8,
    minPaints: 6,
    maxPaints: 15,
    basePoints: 25
  },
  [DIFFICULTY_LEVELS.ADVANCED]: {
    minSteps: 9,
    maxSteps: 15,
    minPaints: 16,
    maxPaints: 30,
    basePoints: 50
  },
  [DIFFICULTY_LEVELS.EXPERT]: {
    minSteps: 16,
    maxSteps: 999,
    minPaints: 31,
    maxPaints: 999,
    basePoints: 100
  }
};

// Dynamic achievement definitions - all data driven
export const ACHIEVEMENT_DEFINITIONS = {
  [ACHIEVEMENT_CATEGORIES.CREATE_PROJECT]: [
    { id: 'first_project', name: 'Getting Started', description: 'Create your first project', threshold: 1, points: 10, icon: '🎯' },
    { id: 'project_creator', name: 'Project Creator', description: 'Create 5 projects', threshold: 5, points: 25, icon: '📋' },
    { id: 'project_enthusiast', name: 'Project Enthusiast', description: 'Create 10 projects', threshold: 10, points: 50, icon: '🚀' },
    { id: 'project_master', name: 'Project Master', description: 'Create 25 projects', threshold: 25, points: 100, icon: '👑' },
    { id: 'project_legend', name: 'Project Legend', description: 'Create 50 projects', threshold: 50, points: 200, icon: '🏆' },
    { id: 'project_titan', name: 'Project Titan', description: 'Create 100 projects', threshold: 100, points: 500, icon: '⭐' }
  ],

  [ACHIEVEMENT_CATEGORIES.PAINT_MASTER]: [
    { id: 'paint_dabbler', name: 'Paint Dabbler', description: 'Use 5+ different paints in projects', threshold: 5, points: 15, icon: '🎨' },
    { id: 'paint_explorer', name: 'Paint Explorer', description: 'Use 10+ different paints in projects', threshold: 10, points: 30, icon: '🖌️' },
    { id: 'paint_collector', name: 'Paint Collector', description: 'Use 25+ different paints in projects', threshold: 25, points: 75, icon: '🎭' },
    { id: 'paint_connoisseur', name: 'Paint Connoisseur', description: 'Use 50+ different paints in projects', threshold: 50, points: 150, icon: '🎪' },
    { id: 'paint_virtuoso', name: 'Paint Virtuoso', description: 'Use 100+ different paints in projects', threshold: 100, points: 300, icon: '🌈' },
    { id: 'paint_master', name: 'Paint Master', description: 'Use 150+ different paints in projects', threshold: 150, points: 450, icon: '🎨' },
    { id: 'paint_grandmaster', name: 'Paint Grandmaster', description: 'Use 200+ different paints in projects', threshold: 200, points: 600, icon: '👨‍🎨' },
    { id: 'paint_legend', name: 'Paint Legend', description: 'Use 250+ different paints in projects', threshold: 250, points: 750, icon: '🏛️' }
  ],

  [ACHIEVEMENT_CATEGORIES.COMPLETIONIST]: [
    { id: 'first_finish', name: 'First Finish', description: 'Complete your first project', threshold: 1, points: 20, icon: '✅' },
    { id: 'finisher', name: 'Finisher', description: 'Complete 5 projects', threshold: 5, points: 50, icon: '🏁' },
    { id: 'dedicated_finisher', name: 'Dedicated Finisher', description: 'Complete 10 projects', threshold: 10, points: 100, icon: '🎖️' },
    { id: 'completion_master', name: 'Completion Master', description: 'Complete 25 projects', threshold: 25, points: 250, icon: '🏆' },
    { id: 'completion_legend', name: 'Completion Legend', description: 'Complete 50 projects', threshold: 50, points: 500, icon: '👑' },
    { id: 'completion_titan', name: 'Completion Titan', description: 'Complete 100 projects', threshold: 100, points: 1000, icon: '⭐' }
  ],

  [ACHIEVEMENT_CATEGORIES.BRAND_EXPLORER]: [
    { id: 'brand_curious', name: 'Brand Curious', description: 'Try 3 different paint brands', threshold: 3, points: 20, icon: '🔍' },
    { id: 'brand_explorer', name: 'Brand Explorer', description: 'Try 5 different paint brands', threshold: 5, points: 40, icon: '🗺️' },
    { id: 'brand_connoisseur', name: 'Brand Connoisseur', description: 'Try 10 different paint brands', threshold: 10, points: 100, icon: '🎯' }
  ],

  [ACHIEVEMENT_CATEGORIES.TECHNIQUE_SPECIALIST]: [
    { id: 'technique_learner', name: 'Technique Learner', description: 'Use 3 different techniques', threshold: 3, points: 25, icon: '📚' },
    { id: 'technique_explorer', name: 'Technique Explorer', description: 'Use 5 different techniques', threshold: 5, points: 50, icon: '🎪' },
    { id: 'technique_master', name: 'Technique Master', description: 'Use 10 different techniques', threshold: 10, points: 125, icon: '🎭' }
  ],

  [ACHIEVEMENT_CATEGORIES.STEP_MASTER]: [
    { id: 'step_starter', name: 'Step Starter', description: 'Create 5 steps across all projects', threshold: 5, points: 15, icon: '👣' },
    { id: 'step_builder', name: 'Step Builder', description: 'Create 10+ steps across all projects', threshold: 10, points: 30, icon: '🔨' },
    { id: 'step_architect', name: 'Step Architect', description: 'Create 25+ steps across all projects', threshold: 25, points: 75, icon: '🏗️' },
    { id: 'step_engineer', name: 'Step Engineer', description: 'Create 50+ steps across all projects', threshold: 50, points: 150, icon: '⚙️' },
    { id: 'step_master', name: 'Step Master', description: 'Create 100+ steps across all projects', threshold: 100, points: 300, icon: '🎯' }
  ],

  [ACHIEVEMENT_CATEGORIES.PHOTO_DOCUMENTARIAN]: [
    { id: 'first_shot', name: 'First Shot', description: 'Take 5+ project photos', threshold: 5, points: 10, icon: '📸' },
    { id: 'photo_hobbyist', name: 'Photo Hobbyist', description: 'Take 10+ project photos', threshold: 10, points: 25, icon: '📷' },
    { id: 'photo_enthusiast', name: 'Photo Enthusiast', description: 'Take 25+ project photos', threshold: 25, points: 60, icon: '🎬' },
    { id: 'photo_documentarian', name: 'Photo Documentarian', description: 'Take 50+ project photos', threshold: 50, points: 125, icon: '🎥' },
    { id: 'photo_archivist', name: 'Photo Archivist', description: 'Take 100+ project photos', threshold: 100, points: 250, icon: '📚' },
    { id: 'photo_chronicler', name: 'Photo Chronicler', description: 'Take 150+ project photos', threshold: 150, points: 375, icon: '📖' },
    { id: 'photo_historian', name: 'Photo Historian', description: 'Take 200+ project photos', threshold: 200, points: 500, icon: '🏛️' }
  ]
};

// Streak system configuration
export const STREAK_TYPES = {
  DAILY_ACTIVITY: 'daily_activity',
  WEEKLY_COMPLETION: 'weekly_completion'
};

export const STREAK_DEFINITIONS = {
  [STREAK_TYPES.DAILY_ACTIVITY]: {
    name: 'Daily Activity',
    description: 'Work on any project daily',
    icon: '🔥',
    milestones: [7, 14, 30, 60, 100, 365] // Days
  },
  [STREAK_TYPES.WEEKLY_COMPLETION]: {
    name: 'Weekly Completion',
    description: 'Complete at least 1 step per week',
    icon: '⚡',
    milestones: [4, 8, 12, 26, 52] // Weeks
  }
};

// Gamification data schema additions for user profile
export const GAMIFICATION_SCHEMA = {
  achievements: {
    unlockedBadges: [], // Array of achievement IDs
    progress: {}, // { achievementId: currentProgress }
    totalPoints: 0,
    lastChecked: null
  },
  streaks: {
    [STREAK_TYPES.DAILY_ACTIVITY]: {
      current: 0,
      longest: 0,
      lastActivity: null
    },
    [STREAK_TYPES.WEEKLY_COMPLETION]: {
      current: 0,
      longest: 0,
      lastCompletion: null
    }
  },
  statistics: {
    projectsCreated: 0,
    projectsCompleted: 0,
    totalSteps: 0,
    totalPhotos: 0,
    uniquePaintsUsed: 0,
    uniqueBrandsUsed: 0,
    uniqueTechniquesUsed: 0,
    lastCalculated: null
  },
  preferences: {
    showAchievementNotifications: true,
    showStreakNotifications: true,
    emailWeeklySummary: true
  }
};

// Helper function to calculate project difficulty
export const calculateProjectDifficulty = (project) => {
  const stepCount = project.steps?.length || 0;
  const paintCount = project.paintOverview?.length || 0;

  // Check each difficulty level
  for (const [level, config] of Object.entries(DIFFICULTY_SCORING)) {
    if (stepCount >= config.minSteps && stepCount <= config.maxSteps &&
        paintCount >= config.minPaints && paintCount <= config.maxPaints) {
      return level;
    }
  }

  // Default to expert if exceeds all ranges
  return DIFFICULTY_LEVELS.EXPERT;
};

// Helper function to calculate complexity score
export const calculateComplexityScore = (project) => {
  const difficulty = calculateProjectDifficulty(project);
  const basePoints = DIFFICULTY_SCORING[difficulty].basePoints;

  const stepCount = project.steps?.length || 0;
  const paintCount = project.paintOverview?.length || 0;
  const photoCount = (project.photoURLs?.length || 0) +
                    (project.steps?.reduce((acc, step) => acc + (step.photos?.length || 0), 0) || 0);

  // Count unique techniques used
  const techniques = new Set();
  project.steps?.forEach(step => {
    step.paints?.forEach(paint => {
      if (paint.technique) {
        techniques.add(paint.technique);
      }
    });
  });

  // Complexity multipliers
  const stepMultiplier = stepCount * 2;
  const paintMultiplier = paintCount * 1.5;
  const photoMultiplier = photoCount * 0.5;
  const techniqueMultiplier = techniques.size * 5;

  return Math.round(basePoints + stepMultiplier + paintMultiplier + photoMultiplier + techniqueMultiplier);
};

export default {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_DEFINITIONS,
  DIFFICULTY_LEVELS,
  DIFFICULTY_SCORING,
  STREAK_TYPES,
  STREAK_DEFINITIONS,
  GAMIFICATION_SCHEMA,
  calculateProjectDifficulty,
  calculateComplexityScore
};