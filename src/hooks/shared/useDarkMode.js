// hooks/shared/useDarkMode.js
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'darkMode';

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check system preference
  const getSystemPreference = useCallback(() => {
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (error) {
      console.error('Error checking system preference:', error);
      return false;
    }
  }, []);

  // Get saved preference from localStorage
  const getSavedPreference = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return null;
    } catch (error) {
      console.error('Error reading dark mode preference from localStorage:', error);
      return null;
    }
  }, []);

  // Save preference to localStorage
  const savePreference = useCallback((isDark) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isDark));
    } catch (error) {
      console.error('Error saving dark mode preference to localStorage:', error);
    }
  }, []);

  // Apply dark mode to document
  const applyDarkMode = useCallback((isDark) => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error applying dark mode to document:', error);
    }
  }, []);

  // Initialize dark mode on mount
  useEffect(() => {
    const savedPreference = getSavedPreference();
    const systemPreference = getSystemPreference();

    // Use saved preference if available, otherwise use system preference
    const initialDarkMode = savedPreference !== null ? savedPreference : systemPreference;

    setDarkMode(initialDarkMode);
    applyDarkMode(initialDarkMode);
    setIsLoading(false);

    console.log('🌓 Dark mode initialized:', {
      savedPreference,
      systemPreference,
      finalChoice: initialDarkMode
    });
  }, [getSavedPreference, getSystemPreference, applyDarkMode]);

  // Listen for system preference changes
  useEffect(() => {
    let mediaQuery;

    try {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleSystemChange = (e) => {
        const savedPreference = getSavedPreference();

        // Only update if user hasn't set a manual preference
        if (savedPreference === null) {
          console.log('🌓 System preference changed:', e.matches);
          setDarkMode(e.matches);
          applyDarkMode(e.matches);
        }
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemChange);
      } else if (mediaQuery.addListener) {
        // Fallback for older browsers
        mediaQuery.addListener(handleSystemChange);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleSystemChange);
        } else if (mediaQuery.removeListener) {
          mediaQuery.removeListener(handleSystemChange);
        }
      };
    } catch (error) {
      console.error('Error setting up system preference listener:', error);
    }
  }, [getSavedPreference, applyDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !darkMode;

    setDarkMode(newDarkMode);
    applyDarkMode(newDarkMode);
    savePreference(newDarkMode);

    console.log('🌓 Dark mode toggled:', newDarkMode);
  }, [darkMode, applyDarkMode, savePreference]);

  // Set dark mode to specific value
  const setDarkModeValue = useCallback((isDark) => {
    if (isDark !== darkMode) {
      setDarkMode(isDark);
      applyDarkMode(isDark);
      savePreference(isDark);

      console.log('🌓 Dark mode set to:', isDark);
    }
  }, [darkMode, applyDarkMode, savePreference]);

  // Reset to system preference
  const resetToSystemPreference = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      const systemPreference = getSystemPreference();

      setDarkMode(systemPreference);
      applyDarkMode(systemPreference);

      console.log('🌓 Reset to system preference:', systemPreference);
    } catch (error) {
      console.error('Error resetting to system preference:', error);
    }
  }, [getSystemPreference, applyDarkMode]);

  // Check if user has set a manual preference
  const hasManualPreference = useCallback(() => {
    const saved = getSavedPreference();
    return saved !== null;
  }, [getSavedPreference]);

  return {
    darkMode,
    isLoading,
    toggleDarkMode,
    setDarkMode: setDarkModeValue,
    resetToSystemPreference,
    hasManualPreference,
    systemPreference: getSystemPreference()
  };
};