// hooks/useSubscription.js - Fixed with proper photo limit checking for all contexts
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { getAllPaints } from '../services/paints/index.js';
import { getAllProjects } from '../services/projects/index.js';

export const useSubscription = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [usage, setUsage] = useState({
    paints: 0,
    projects: 0,
    photosUsed: 0,
    stepsUsed: 0,
    paintAssignmentsUsed: 0,
    notesUsed: 0
  });
  const [loading, setLoading] = useState(true);

  // Complete subscription tier limits
  const TIER_LIMITS = {
    free: {
      paints: 25,
      projects: 3,
      photosPerProject: 3,
      stepsPerProject: 5,
      paintAssignmentsPerProject: 10,
      notesPerProject: 5
    },
    casual: {
      paints: 150,
      projects: 10,
      photosPerProject: 10,
      stepsPerProject: 15,
      paintAssignmentsPerProject: 30,
      notesPerProject: 15
    },
    pro: {
      paints: 300,
      projects: 25,
      photosPerProject: 30,
      stepsPerProject: 50,
      paintAssignmentsPerProject: 100,
      notesPerProject: 50
    },
    battle: {
      paints: 1000,
      projects: 50,
      photosPerProject: 50,
      stepsPerProject: 100,
      paintAssignmentsPerProject: 250,
      notesPerProject: 100,
      armyTracker: true,
      battleReports: true
    }
  };

  // Get current tier limits
  const getCurrentLimits = () => {
    const tier = userProfile?.subscription?.tier || 'free';
    return TIER_LIMITS[tier] || TIER_LIMITS.free;
  };

  // STANDARDIZED PHOTO COUNTING FUNCTION
  // Handles all photo data structures: existing projects, wizard form data, etc.
  const getPhotoCount = (dataSource) => {
    if (!dataSource) return 0;

    // Handle wizard form data
    if (dataSource.uploadedPhotos && Array.isArray(dataSource.uploadedPhotos)) {
      return dataSource.uploadedPhotos.length;
    }

    // Handle existing project data - new format (photos array)
    if (dataSource.photos && Array.isArray(dataSource.photos)) {
      return dataSource.photos.length;
    }

    // Handle existing project data - old format (photoURLs array)
    if (dataSource.photoURLs && Array.isArray(dataSource.photoURLs)) {
      return dataSource.photoURLs.length;
    }

    // Handle existing project data - gallery structure
    if (dataSource.photos && dataSource.photos.gallery && Array.isArray(dataSource.photos.gallery)) {
      return dataSource.photos.gallery.length;
    }

    return 0;
  };

  // STANDARDIZED STEP COUNTING FUNCTION
  const getStepCount = (dataSource) => {
    if (!dataSource || !dataSource.steps || !Array.isArray(dataSource.steps)) {
      return 0;
    }
    return dataSource.steps.length;
  };

  // STANDARDIZED PAINT ASSIGNMENT COUNTING FUNCTION
  const getPaintAssignmentCount = (dataSource) => {
    if (!dataSource || !dataSource.steps || !Array.isArray(dataSource.steps)) {
      return 0;
    }

    return dataSource.steps.reduce((total, step) => {
      return total + (step.paints ? step.paints.length : 0);
    }, 0);
  };

  // STANDARDIZED NOTES COUNTING FUNCTION
  const getNotesCount = (dataSource) => {
    if (!dataSource) return 0;

    // Handle different note storage formats
    if (dataSource.projectNotes && Array.isArray(dataSource.projectNotes)) {
      return dataSource.projectNotes.length;
    }

    if (dataSource.notes && Array.isArray(dataSource.notes)) {
      return dataSource.notes.length;
    }

    return 0;
  };

  // Load current usage across all projects
  const loadUsage = async () => {
    if (!userProfile) return;

    setLoading(true);
    try {
      // Try to get data from React Query cache first
      const cachedProjects = queryClient.getQueryData(['projects']);
      const cachedPaints = queryClient.getQueryData(['paints', 'collection']);

      let paints, projects;

      if (cachedProjects && cachedPaints) {
        paints = cachedPaints;
        projects = cachedProjects;
      } else {
        const [paintsResult, projectsResult] = await Promise.all([
          getAllPaints(),
          getAllProjects()
        ]);
        paints = paintsResult;
        projects = projectsResult;
      }

      // Calculate total usage using standardized counting functions
      let totalPhotos = 0;
      let totalSteps = 0;
      let totalPaintAssignments = 0;
      let totalNotes = 0;

      projects.forEach(project => {
        totalPhotos += getPhotoCount(project);
        totalSteps += getStepCount(project);
        totalPaintAssignments += getPaintAssignmentCount(project);
        totalNotes += getNotesCount(project);
      });

      setUsage({
        paints: paints.length,
        projects: projects.length,
        photosUsed: totalPhotos,
        stepsUsed: totalSteps,
        paintAssignmentsUsed: totalPaintAssignments,
        notesUsed: totalNotes
      });
    } catch (error) {
      console.error('Error loading usage:', error);
    } finally {
      setLoading(false);
    }
  };

  // IMPROVED: Check if user has reached a specific limit
  const hasReachedLimit = (type, projectSpecific = false, dataSource = null) => {
    const limits = getCurrentLimits();

    switch (type) {
      case 'paints':
        return usage.paints >= limits.paints;
      case 'projects':
        return usage.projects >= limits.projects;
      case 'photos':
        if (projectSpecific && dataSource) {
          const currentPhotos = getPhotoCount(dataSource);
          return currentPhotos >= limits.photosPerProject;
        }
        return false;
      case 'steps':
        if (projectSpecific && dataSource) {
          const currentSteps = getStepCount(dataSource);
          return currentSteps >= limits.stepsPerProject;
        }
        return false;
      case 'paintAssignments':
        if (projectSpecific && dataSource) {
          const currentAssignments = getPaintAssignmentCount(dataSource);
          return currentAssignments >= limits.paintAssignmentsPerProject;
        }
        return false;
      case 'notes':
        if (projectSpecific && dataSource) {
          const currentNotes = getNotesCount(dataSource);
          return currentNotes >= limits.notesPerProject;
        }
        return false;
      default:
        return false;
    }
  };

  // IMPROVED: Get remaining allowance for a limit type
  const getRemainingAllowance = (type, projectSpecific = false, dataSource = null) => {
    const limits = getCurrentLimits();

    switch (type) {
      case 'paints':
        return Math.max(0, limits.paints - usage.paints);
      case 'projects':
        return Math.max(0, limits.projects - usage.projects);
      case 'photos':
        if (projectSpecific && dataSource) {
          const currentPhotos = getPhotoCount(dataSource);
          return Math.max(0, limits.photosPerProject - currentPhotos);
        }
        return limits.photosPerProject;
      case 'steps':
        if (projectSpecific && dataSource) {
          const currentSteps = getStepCount(dataSource);
          return Math.max(0, limits.stepsPerProject - currentSteps);
        }
        return limits.stepsPerProject;
      case 'paintAssignments':
        if (projectSpecific && dataSource) {
          const currentAssignments = getPaintAssignmentCount(dataSource);
          return Math.max(0, limits.paintAssignmentsPerProject - currentAssignments);
        }
        return limits.paintAssignmentsPerProject;
      case 'notes':
        if (projectSpecific && dataSource) {
          const currentNotes = getNotesCount(dataSource);
          return Math.max(0, limits.notesPerProject - currentNotes);
        }
        return limits.notesPerProject;
      default:
        return 0;
    }
  };

  // IMPROVED: Get usage percentage for a limit type
  const getUsagePercentage = (type, projectSpecific = false, dataSource = null) => {
    const limits = getCurrentLimits();

    switch (type) {
      case 'paints':
        return Math.min(100, (usage.paints / limits.paints) * 100);
      case 'projects':
        return Math.min(100, (usage.projects / limits.projects) * 100);
      case 'photos':
        if (projectSpecific && dataSource) {
          const currentPhotos = getPhotoCount(dataSource);
          return Math.min(100, (currentPhotos / limits.photosPerProject) * 100);
        }
        return 0;
      case 'steps':
        if (projectSpecific && dataSource) {
          const currentSteps = getStepCount(dataSource);
          return Math.min(100, (currentSteps / limits.stepsPerProject) * 100);
        }
        return 0;
      case 'paintAssignments':
        if (projectSpecific && dataSource) {
          const currentAssignments = getPaintAssignmentCount(dataSource);
          return Math.min(100, (currentAssignments / limits.paintAssignmentsPerProject) * 100);
        }
        return 0;
      case 'notes':
        if (projectSpecific && dataSource) {
          const currentNotes = getNotesCount(dataSource);
          return Math.min(100, (currentNotes / limits.notesPerProject) * 100);
        }
        return 0;
      default:
        return 0;
    }
  };

  // IMPROVED: Check if user can perform an action with proper counting
  const canPerformAction = (type, count = 1, dataSource = null) => {
    const limits = getCurrentLimits();

    switch (type) {
      case 'add_paint':
        return usage.paints + count <= limits.paints;
      case 'add_project':
        return usage.projects + count <= limits.projects;
      case 'add_photo':
        if (dataSource) {
          const currentPhotos = getPhotoCount(dataSource);
          return currentPhotos + count <= limits.photosPerProject;
        }
        // If no dataSource provided, assume this is for a new project
        return count <= limits.photosPerProject;
      case 'add_step':
        if (dataSource) {
          const currentSteps = getStepCount(dataSource);
          return currentSteps + count <= limits.stepsPerProject;
        }
        return count <= limits.stepsPerProject;
      case 'add_paint_assignment':
        if (dataSource) {
          const currentAssignments = getPaintAssignmentCount(dataSource);
          return currentAssignments + count <= limits.paintAssignmentsPerProject;
        }
        return count <= limits.paintAssignmentsPerProject;
      case 'add_note':
        if (dataSource) {
          const currentNotes = getNotesCount(dataSource);
          return currentNotes + count <= limits.notesPerProject;
        }
        return count <= limits.notesPerProject;
      case 'access_army_tracker':
        return limits.armyTracker === true;
      case 'access_battle_reports':
        return limits.battleReports === true;
      default:
        return true;
    }
  };

  // Get upgrade message for when limits are reached
  const getUpgradeMessage = (type) => {
    const tier = userProfile?.subscription?.tier || 'free';
    const nextTier = getNextTier(tier);

    if (!nextTier) return null;

    const nextLimits = TIER_LIMITS[nextTier];
    const nextTierName = getReadableTierName(nextTier);

    const messages = {
      paints: `You've reached your paint limit. Upgrade to ${nextTierName} to track up to ${nextLimits.paints} paints.`,
      projects: `You've reached your project limit. Upgrade to ${nextTierName} to manage up to ${nextLimits.projects} projects.`,
      photos: `You've reached your photo limit for this project. Upgrade to ${nextTierName} for up to ${nextLimits.photosPerProject} photos per project.`,
      steps: `You've reached your step limit for this project. Upgrade to ${nextTierName} for up to ${nextLimits.stepsPerProject} steps per project.`,
      paintAssignments: `You've reached your paint assignment limit. Upgrade to ${nextTierName} for up to ${nextLimits.paintAssignmentsPerProject} assignments per project.`,
      notes: `You've reached your notes limit for this project. Upgrade to ${nextTierName} for up to ${nextLimits.notesPerProject} notes per project.`
    };

    return messages[type];
  };

  // Helper function to get next tier
  const getNextTier = (currentTier) => {
    const tiers = ['free', 'casual', 'pro', 'battle'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  };

  // Helper function to get readable tier names
  const getReadableTierName = (tier) => {
    const names = {
      free: 'Free',
      casual: 'Casual Hobbyist',
      pro: 'Pro',
      battle: 'Battle Ready'
    };
    return names[tier] || tier;
  };

  // Check if user has access to exclusive features
  const hasExclusiveFeature = (feature) => {
    const limits = getCurrentLimits();
    switch (feature) {
      case 'armyTracker':
        return limits.armyTracker === true;
      case 'battleReports':
        return limits.battleReports === true;
      default:
        return false;
    }
  };

  // Load usage when user profile changes or when React Query cache changes
  useEffect(() => {
    if (userProfile) {
      loadUsage();
    }
  }, [userProfile]);

  // Listen for changes to React Query cache and reload usage
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === 'updated' && event?.query?.queryKey) {
        const queryKey = event.query.queryKey;

        if (queryKey[0] === 'projects' ||
            (queryKey[0] === 'project' && queryKey[1]) ||
            queryKey[0] === 'paints') {
          loadUsage();
        }
      }
    });

    return unsubscribe;
  }, [queryClient, userProfile]);

  // Manual refresh function
  const refreshUsage = () => {
    loadUsage();
  };

  return {
    // Current usage
    usage,
    loading,

    // Limits and tier info
    currentTier: userProfile?.subscription?.tier || 'free',
    limits: getCurrentLimits(),
    tierLimits: TIER_LIMITS,

    // Limit checking functions - now properly standardized
    hasReachedLimit,
    canPerformAction,
    getRemainingAllowance,
    getUsagePercentage,

    // Utility counting functions - exposed for consistency
    getPhotoCount,
    getStepCount,
    getPaintAssignmentCount,
    getNotesCount,

    // Feature access
    hasExclusiveFeature,

    // Upgrade messaging
    getUpgradeMessage,
    getReadableTierName: () => getReadableTierName(userProfile?.subscription?.tier || 'free'),

    // Utility functions
    refreshUsage,
    getNextTier: () => getNextTier(userProfile?.subscription?.tier || 'free')
  };
};

export default useSubscription;