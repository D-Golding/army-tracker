// hooks/useGamification.js (compatibility barrel export)
// Re-exports from split gamification hooks for backward compatibility

// Core gamification functionality
export {
  useGamification,
  useAchievements,
  useStreaks,
  useUserStatistics,
  useInitializeGamification,
  useAchievementTrigger
} from './gamification/useGamificationCore';

// Operations and action triggers
export {
  useGamificationOperations,
  useProjectActions
} from './gamification/useGamificationOperations';

// Email management
export {
  useEmailManagement
} from './gamification/useEmailManagement';

// Default export for backward compatibility
export { useGamification as default } from './gamification/useGamificationCore';