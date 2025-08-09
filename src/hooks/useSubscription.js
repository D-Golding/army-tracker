// hooks/useSubscription.js - Updated to be reactive to React Query cache changes
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { getAllPaints } from '../services/paintService';
import { getAllProjects } from '../services/projectService';

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

  // Complete subscription tier limits based on screenshots
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
      // Exclusive features
      armyTracker: true,
      battleReports: true
    }
  };

  // Get current tier limits
  const getCurrentLimits = () => {
    const tier = userProfile?.subscription?.tier || 'free';
    return TIER_LIMITS[tier] || TIER_LIMITS.free;
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
        // Use cached data if available
        paints = cachedPaints;
        projects = cachedProjects;
      } else {
        // Fallback to direct API calls
        const [paintsResult, projectsResult] = await Promise.all([
          getAllPaints(),
          getAllProjects()
        ]);
        paints = paintsResult;
        projects = projectsResult;
      }

      // Calculate total usage across all projects
      let totalPhotos = 0;
      let totalSteps = 0;
      let totalPaintAssignments = 0;
      let totalNotes = 0;

      projects.forEach(project => {
        // Count photos
        const projectPhotos = (project.photoURLs?.length || 0) +
                             (project.photos?.gallery?.length || 0);
        totalPhotos += projectPhotos;

        // Count steps
        const projectSteps = project.steps?.length || 0;
        totalSteps += projectSteps;

        // Count paint assignments across all steps
        if (project.steps) {
          project.steps.forEach(step => {
            totalPaintAssignments += step.paints?.length || 0;
          });
        }

        // Count project notes
        totalNotes += project.projectNotes?.length || 0;
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

  // Check if user has reached a specific limit
  const hasReachedLimit = (type, projectSpecific = false, projectData = null) => {
    const limits = getCurrentLimits();

    switch (type) {
      case 'paints':
        return usage.paints >= limits.paints;
      case 'projects':
        return usage.projects >= limits.projects;
      case 'photos':
        if (projectSpecific && projectData) {
          const projectPhotos = (projectData.photoURLs?.length || 0) +
                               (projectData.photos?.gallery?.length || 0);
          return projectPhotos >= limits.photosPerProject;
        }
        return false;
      case 'steps':
        if (projectSpecific && projectData) {
          const projectSteps = projectData.steps?.length || 0;
          return projectSteps >= limits.stepsPerProject;
        }
        return false;
      case 'paintAssignments':
        if (projectSpecific && projectData) {
          let projectAssignments = 0;
          if (projectData.steps) {
            projectData.steps.forEach(step => {
              projectAssignments += step.paints?.length || 0;
            });
          }
          return projectAssignments >= limits.paintAssignmentsPerProject;
        }
        return false;
      case 'notes':
        if (projectSpecific && projectData) {
          const projectNotes = projectData.projectNotes?.length || 0;
          return projectNotes >= limits.notesPerProject;
        }
        return false;
      default:
        return false;
    }
  };

  // Get remaining allowance for a limit type
  const getRemainingAllowance = (type, projectSpecific = false, projectData = null) => {
    const limits = getCurrentLimits();

    switch (type) {
      case 'paints':
        return Math.max(0, limits.paints - usage.paints);
      case 'projects':
        return Math.max(0, limits.projects - usage.projects);
      case 'photos':
        if (projectSpecific && projectData) {
          const projectPhotos = (projectData.photoURLs?.length || 0) +
                               (projectData.photos?.gallery?.length || 0);
          return Math.max(0, limits.photosPerProject - projectPhotos);
        }
        return limits.photosPerProject;
      case 'steps':
        if (projectSpecific && projectData) {
          const projectSteps = projectData.steps?.length || 0;
          return Math.max(0, limits.stepsPerProject - projectSteps);
        }
        return limits.stepsPerProject;
      case 'paintAssignments':
        if (projectSpecific && projectData) {
          let projectAssignments = 0;
          if (projectData.steps) {
            projectData.steps.forEach(step => {
              projectAssignments += step.paints?.length || 0;
            });
          }
          return Math.max(0, limits.paintAssignmentsPerProject - projectAssignments);
        }
        return limits.paintAssignmentsPerProject;
      case 'notes':
        if (projectSpecific && projectData) {
          const projectNotes = projectData.projectNotes?.length || 0;
          return Math.max(0, limits.notesPerProject - projectNotes);
        }
        return limits.notesPerProject;
      default:
        return 0;
    }
  };

  // Get usage percentage for a limit type
  const getUsagePercentage = (type, projectSpecific = false, projectData = null) => {
    const limits = getCurrentLimits();

    switch (type) {
      case 'paints':
        return Math.min(100, (usage.paints / limits.paints) * 100);
      case 'projects':
        return Math.min(100, (usage.projects / limits.projects) * 100);
      case 'photos':
        if (projectSpecific && projectData) {
          const projectPhotos = (projectData.photoURLs?.length || 0) +
                               (projectData.photos?.gallery?.length || 0);
          return Math.min(100, (projectPhotos / limits.photosPerProject) * 100);
        }
        return 0;
      case 'steps':
        if (projectSpecific && projectData) {
          const projectSteps = projectData.steps?.length || 0;
          return Math.min(100, (projectSteps / limits.stepsPerProject) * 100);
        }
        return 0;
      case 'paintAssignments':
        if (projectSpecific && projectData) {
          let projectAssignments = 0;
          if (projectData.steps) {
            projectData.steps.forEach(step => {
              projectAssignments += step.paints?.length || 0;
            });
          }
          return Math.min(100, (projectAssignments / limits.paintAssignmentsPerProject) * 100);
        }
        return 0;
      case 'notes':
        if (projectSpecific && projectData) {
          const projectNotes = projectData.projectNotes?.length || 0;
          return Math.min(100, (projectNotes / limits.notesPerProject) * 100);
        }
        return 0;
      default:
        return 0;
    }
  };

  // Check if user can perform an action
  const canPerformAction = (type, count = 1, projectData = null) => {
    const limits = getCurrentLimits();

    switch (type) {
      case 'add_paint':
        return usage.paints + count <= limits.paints;
      case 'add_project':
        return usage.projects + count <= limits.projects;
      case 'add_photo':
        if (projectData) {
          const projectPhotos = (projectData.photoURLs?.length || 0) +
                               (projectData.photos?.gallery?.length || 0);
          return projectPhotos + count <= limits.photosPerProject;
        }
        return true;
      case 'add_step':
        if (projectData) {
          const projectSteps = projectData.steps?.length || 0;
          return projectSteps + count <= limits.stepsPerProject;
        }
        return true;
      case 'add_paint_assignment':
        if (projectData) {
          let projectAssignments = 0;
          if (projectData.steps) {
            projectData.steps.forEach(step => {
              projectAssignments += step.paints?.length || 0;
            });
          }
          return projectAssignments + count <= limits.paintAssignmentsPerProject;
        }
        return true;
      case 'add_note':
        if (projectData) {
          const projectNotes = projectData.projectNotes?.length || 0;
          return projectNotes + count <= limits.notesPerProject;
        }
        return true;
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
      // Only react to successful mutations that affect projects or paints
      if (event?.type === 'updated' && event?.query?.queryKey) {
        const queryKey = event.query.queryKey;

        // React to project-related changes
        if (queryKey[0] === 'projects' ||
            (queryKey[0] === 'project' && queryKey[1])) {
          loadUsage();
        }

        // React to paint-related changes
        if (queryKey[0] === 'paints') {
          loadUsage();
        }
      }
    });

    return unsubscribe;
  }, [queryClient, userProfile]);

  // Manual refresh function (can be called after adding/removing items)
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

    // Limit checking functions
    hasReachedLimit,
    canPerformAction,
    getRemainingAllowance,
    getUsagePercentage,

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