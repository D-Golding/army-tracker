// contexts/AuthContext.jsx - Professional Authentication System with Community Safety and Gamification
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import { queryClient } from '../lib/queryClient.js';
import { getTierLimits } from '../config/subscriptionConfig.js';
import { GAMIFICATION_SCHEMA } from '../config/achievementConfig.js';

// Authentication States
const AUTH_STATES = {
  LOADING: 'loading',
  UNAUTHENTICATED: 'unauthenticated',
  AUTHENTICATED_NEEDS_ONBOARDING: 'authenticated_needs_onboarding',
  AUTHENTICATED_COMPLETE: 'authenticated_complete'
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Core Auth State
  const [authState, setAuthState] = useState(AUTH_STATES.LOADING);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Error Handling
  const [authError, setAuthError] = useState(null);

  // Onboarding State
  const [onboardingStep, setOnboardingStep] = useState(null); // 'age-verification', 'privacy-consent', 'tier-selection'

  // Clear any existing auth error
  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Complete data wipe function for cancel/logout
  const completeDataWipe = useCallback(async () => {
    try {
      // 1. Sign out from Firebase Auth
      await signOut(auth);

      // 2. Clear all browser storage
      localStorage.clear();
      sessionStorage.clear();

      // 3. Clear React Query cache completely
      queryClient.clear();

      // 4. Reset all local state
      setCurrentUser(null);
      setUserProfile(null);
      setOnboardingStep(null);
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      setAuthError(null);

      console.log('Complete data wipe completed - all user data cleared');
    } catch (error) {
      console.error('Error during data wipe:', error);
      // Still try to clear local state even if Firebase signOut fails
      setCurrentUser(null);
      setUserProfile(null);
      setOnboardingStep(null);
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      setAuthError(null);
    }
  }, []);

  // Cancel onboarding - complete wipe and return to landing
  const cancelOnboarding = useCallback(async () => {
    await completeDataWipe();
    // Navigation to landing page will be handled by the component
    return true;
  }, [completeDataWipe]);

  // Helper function to get user-friendly error messages
  const getAuthErrorMessage = useCallback((errorCode) => {
    switch (errorCode) {
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed.';
      default:
        return 'An error occurred. Please try again.';
    }
  }, []);

  // Initialize gamification data for a user
  const initializeGamificationData = useCallback(() => {
    return {
      ...GAMIFICATION_SCHEMA,
      achievements: {
        ...GAMIFICATION_SCHEMA.achievements,
        lastChecked: serverTimestamp()
      },
      statistics: {
        ...GAMIFICATION_SCHEMA.statistics,
        lastCalculated: serverTimestamp()
      }
    };
  }, []);

  // Create or load user profile
  const createUserProfile = useCallback(async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // New user - create minimal profile, they'll need onboarding
      const { displayName, email, photoURL } = user;
      const finalDisplayName = displayName || email.split('@')[0];

      const newProfile = {
        displayName: finalDisplayName,
        email,
        photoURL: photoURL || null,
        createdAt: serverTimestamp(),

        // Onboarding status
        onboardingComplete: false,
        ageVerified: false,
        privacyConsented: false,
        tierSelected: false,

        // Will be set during onboarding
        dateOfBirth: null,
        age: null,
        userCategory: null, // 'minor' or 'adult'
        privacyConsents: null,
        subscription: null,
        limits: null,

        // Default preferences
        preferences: {
          theme: 'light',
          notifications: true
        },

        // Safety & Compliance
        communityAccess: false, // Set to true only after age verification for adults
        parentalNotificationRequired: false, // Set to true for 13-17 age group

        // GAMIFICATION INITIALIZATION - Always added for new users
        gamification: initializeGamificationData(),

        // Metadata
        lastLoginAt: serverTimestamp(),
        profileVersion: '2.0'
      };

      await setDoc(userRef, newProfile);

      const profileWithId = { uid: user.uid, ...newProfile };
      setUserProfile(profileWithId);

      // New user needs complete onboarding
      setOnboardingStep('age-verification');
      setAuthState(AUTH_STATES.AUTHENTICATED_NEEDS_ONBOARDING);

      console.log('✅ New user created with gamification system initialized');
      return profileWithId;
    } else {
      // Existing user
      const existingProfile = { uid: user.uid, ...userSnap.data() };

      // GAMIFICATION MIGRATION - Add gamification data if missing
      if (!existingProfile.gamification) {
        console.log('🔄 Migrating existing user to gamification system...');

        const gamificationData = initializeGamificationData();

        // Update the user profile with gamification data
        await setDoc(userRef, {
          gamification: gamificationData,
          lastLoginAt: serverTimestamp()
        }, { merge: true });

        existingProfile.gamification = gamificationData;
        console.log('✅ Gamification system added to existing user');
      } else {
        // Just update last login
        await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
      }

      // Sync displayName if needed
      if (user.displayName && user.displayName !== existingProfile.displayName) {
        await setDoc(userRef, { displayName: user.displayName }, { merge: true });
        existingProfile.displayName = user.displayName;
      }

      setUserProfile(existingProfile);

      // Check if user needs to complete onboarding
      if (!existingProfile.onboardingComplete) {
        // Determine which step they need
        if (!existingProfile.ageVerified) {
          setOnboardingStep('age-verification');
        } else if (!existingProfile.privacyConsented) {
          setOnboardingStep('privacy-consent');
        } else if (!existingProfile.tierSelected) {
          setOnboardingStep('tier-selection');
        }
        setAuthState(AUTH_STATES.AUTHENTICATED_NEEDS_ONBOARDING);
      } else {
        setOnboardingStep(null);
        setAuthState(AUTH_STATES.AUTHENTICATED_COMPLETE);
      }

      return existingProfile;
    }
  }, [initializeGamificationData]);

  // Complete age verification step
  const completeAgeVerification = useCallback(async (ageData) => {
    if (!currentUser) throw new Error('No authenticated user');

    const userRef = doc(db, 'users', currentUser.uid);
    const isMinor = ageData.userCategory === 'minor';

    const updates = {
      dateOfBirth: ageData.dateOfBirth,
      age: ageData.age,
      userCategory: ageData.userCategory,
      ageVerified: true,
      ageVerifiedAt: serverTimestamp(),

      // Safety settings based on age
      communityAccess: !isMinor, // Only adults get community access initially
      parentalNotificationRequired: isMinor,

      // Feature restrictions for minors
      restrictedFeatures: isMinor ? ['messaging', 'photo_sharing', 'marketing'] : []
    };

    await setDoc(userRef, updates, { merge: true });

    // Update local state
    setUserProfile(prev => ({ ...prev, ...updates }));
    setOnboardingStep('privacy-consent');

    return updates;
  }, [currentUser]);

  // Complete privacy consent step
  const completePrivacyConsent = useCallback(async (consentData) => {
    if (!currentUser) throw new Error('No authenticated user');

    const userRef = doc(db, 'users', currentUser.uid);

    const updates = {
      privacyConsents: consentData,
      privacyConsented: true,
      privacyConsentedAt: serverTimestamp(),

      // Update community access based on consent (adults only)
      communityAccess: consentData.community && userProfile?.userCategory === 'adult'
    };

    await setDoc(userRef, updates, { merge: true });

    // Update local state
    setUserProfile(prev => ({ ...prev, ...updates }));
    setOnboardingStep('tier-selection');

    return updates;
  }, [currentUser, userProfile?.userCategory]);

  // Complete tier selection and finish onboarding
  const completeTierSelection = useCallback(async (selectedTier = 'free') => {
    if (!currentUser) throw new Error('No authenticated user');

    const userRef = doc(db, 'users', currentUser.uid);
    const tierLimits = getTierLimits(selectedTier);

    const updates = {
      subscription: {
        tier: selectedTier,
        type: selectedTier === 'free' ? 'free' : 'trial',
        expiresAt: selectedTier === 'free' ? null : null, // Will be set after payment
        stripeCustomerId: null,
        createdAt: serverTimestamp()
      },
      limits: tierLimits,
      tierSelected: true,
      onboardingComplete: true,
      onboardingCompletedAt: serverTimestamp()
    };

    await setDoc(userRef, updates, { merge: true });

    // Update local state
    setUserProfile(prev => ({ ...prev, ...updates }));
    setOnboardingStep(null);
    setAuthState(AUTH_STATES.AUTHENTICATED_COMPLETE);

    // 🎉 TRIGGER FIRST ACHIEVEMENT CHECK
    try {
      // Import and trigger achievement processing after onboarding complete
      const { processUserAchievements } = await import('../services/achievementService.js');
      await processUserAchievements(currentUser.uid, 'onboarding_complete');
      console.log('🎉 Achievement system activated for new user!');
    } catch (error) {
      console.error('Error triggering initial achievements:', error);
      // Don't throw - onboarding should still complete even if achievements fail
    }

    return updates;
  }, [currentUser]);

  // Register with email and password
  const register = useCallback(async (email, password, displayName) => {
    try {
      setAuthError(null);

      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Update the display name in Firebase Auth first
      if (displayName) {
        await updateProfile(user, { displayName });
        await user.reload();
      }

      // Profile creation will be handled by the auth state listener
      return user;
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthError(errorMessage);
      throw error;
    }
  }, [getAuthErrorMessage]);

  // Login with email and password
  const login = useCallback(async (email, password) => {
    try {
      setAuthError(null);

      const { user } = await signInWithEmailAndPassword(auth, email, password);

      // Profile loading will be handled by the auth state listener
      return user;
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthError(errorMessage);
      throw error;
    }
  }, [getAuthErrorMessage]);

  // Google OAuth login
  const loginWithGoogle = useCallback(async () => {
    try {
      setAuthError(null);

      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      // Profile creation/loading will be handled by the auth state listener
      return user;
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthError(errorMessage);
      throw error;
    }
  }, [getAuthErrorMessage]);

  // Logout with complete data wipe
  const logout = useCallback(async () => {
    await completeDataWipe();
  }, [completeDataWipe]);

  // Reset password
  const resetPassword = useCallback(async (email) => {
    try {
      setAuthError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthError(errorMessage);
      throw error;
    }
  }, [getAuthErrorMessage]);

  // Update user profile
  const updateUserProfile = useCallback(async (updates) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });

      // If updating displayName, also update Firebase Auth
      if (updates.displayName) {
        await updateProfile(currentUser, { displayName: updates.displayName });
      }

      setUserProfile(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [currentUser]);

  // Check if user has reached limits (placeholder for future implementation)
  const checkLimits = useCallback(async () => {
    if (!currentUser || !userProfile) return null;

    try {
      // This would check current usage against limits
      // Implementation depends on how you want to count usage
      return {
        paints: { used: 0, limit: userProfile.limits?.paints || 25 },
        projects: { used: 0, limit: userProfile.limits?.projects || 2 },
        photos: { used: 0, limit: userProfile.limits?.photosPerProject || 3 }
      };
    } catch (error) {
      console.error('Error checking limits:', error);
      return null;
    }
  }, [currentUser, userProfile]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);

        if (user) {
          // User is authenticated, create/load their profile
          await createUserProfile(user);
        } else {
          // User is not authenticated
          setUserProfile(null);
          setOnboardingStep(null);
          setAuthState(AUTH_STATES.UNAUTHENTICATED);
        }
      } catch (error) {
        console.error('Error in auth state listener:', error);
        setAuthError('Failed to load user profile. Please try refreshing the page.');
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
      }
    });

    return unsubscribe;
  }, [createUserProfile]);

  // Computed values for easier access
  const isLoading = authState === AUTH_STATES.LOADING;
  const isAuthenticated = currentUser !== null;
  const needsOnboarding = authState === AUTH_STATES.AUTHENTICATED_NEEDS_ONBOARDING;
  const isOnboardingComplete = authState === AUTH_STATES.AUTHENTICATED_COMPLETE;

  // Feature access helpers
  const hasFeatureAccess = useCallback((feature) => {
    if (!userProfile) return false;

    const restrictedFeatures = userProfile.restrictedFeatures || [];
    return !restrictedFeatures.includes(feature);
  }, [userProfile]);

  const hasCommunityAccess = useCallback(() => {
    return userProfile?.communityAccess === true;
  }, [userProfile]);

  const value = {
    // Core State
    authState,
    currentUser,
    userProfile,
    isLoading,
    isAuthenticated,
    needsOnboarding,
    isOnboardingComplete,

    // Onboarding
    onboardingStep,
    completeAgeVerification,
    completePrivacyConsent,
    completeTierSelection,
    cancelOnboarding,

    // Auth Actions
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,

    // Profile Management
    updateUserProfile,
    checkLimits,

    // Feature Access
    hasFeatureAccess,
    hasCommunityAccess,

    // Error Handling
    authError,
    clearError,

    // Constants
    AUTH_STATES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};