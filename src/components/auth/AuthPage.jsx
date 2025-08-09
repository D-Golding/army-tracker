// components/auth/AuthPage.jsx - Complete Authentication Flow with Onboarding
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Palette } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AgeVerification, { UnderAgeNotice } from './AgeVerification';
import PrivacyConsent from './PrivacyConsent';
import TierSelection from './TierSelection';
import ErrorBoundary from '../common/ErrorBoundary';

const AuthPage = () => {
  const {
    authState,
    onboardingStep,
    userProfile,
    isOnboardingComplete,
    completeAgeVerification,
    completePrivacyConsent,
    completeTierSelection,
    AUTH_STATES
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // Local state for auth form switching
  const [isLogin, setIsLogin] = useState(true);
  const [showUnderAgeNotice, setShowUnderAgeNotice] = useState(false);

  // Redirect to app if user is fully authenticated and onboarding is complete
  useEffect(() => {
    if (authState === AUTH_STATES.AUTHENTICATED_COMPLETE && isOnboardingComplete) {
      const from = location.state?.from?.pathname || '/app';
      navigate(from, { replace: true });
    }
  }, [authState, isOnboardingComplete, navigate, location, AUTH_STATES]);

  // Handle age verification completion
  const handleAgeVerificationComplete = async (ageData) => {
    try {
      await completeAgeVerification(ageData);
      // State will automatically update via AuthContext
    } catch (error) {
      console.error('Age verification failed:', error);
    }
  };

  // Handle when user is under 13
  const handleUnderAge = () => {
    setShowUnderAgeNotice(true);
  };

  // Handle privacy consent completion
  const handlePrivacyConsentComplete = async (consentData) => {
    try {
      await completePrivacyConsent(consentData);
      // State will automatically update via AuthContext
    } catch (error) {
      console.error('Privacy consent failed:', error);
    }
  };

  // Handle privacy consent decline
  const handlePrivacyConsentDecline = () => {
    // User declined privacy consent - they cannot proceed
    // In production, you might want to show a different message or redirect
    setIsLogin(true); // Go back to login form
  };

  // Handle tier selection completion
  const handleTierSelectionComplete = async (selectedTier) => {
    try {
      await completeTierSelection(selectedTier);
      // AuthContext will handle navigation automatically
    } catch (error) {
      console.error('Tier selection failed:', error);
    }
  };

  // Handle going back from under age notice
  const handleGoBackFromUnderAge = () => {
    setShowUnderAgeNotice(false);
    setIsLogin(true);
  };

  // Determine what to render based on auth state and onboarding step
  const renderContent = () => {
    // Show under age notice if user is under 13
    if (showUnderAgeNotice) {
      return <UnderAgeNotice onGoBack={handleGoBackFromUnderAge} />;
    }

    // If user needs onboarding, show appropriate step
    if (authState === AUTH_STATES.AUTHENTICATED_NEEDS_ONBOARDING) {
      switch (onboardingStep) {
        case 'age-verification':
          return (
            <AgeVerification
              onComplete={handleAgeVerificationComplete}
              onUnderAge={handleUnderAge}
            />
          );

        case 'privacy-consent':
          return (
            <PrivacyConsent
              userAge={userProfile?.age}
              onComplete={handlePrivacyConsentComplete}
              onDecline={handlePrivacyConsentDecline}
            />
          );

        case 'tier-selection':
          return <TierSelection onComplete={handleTierSelectionComplete} />;

        default:
          return (
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Setting up your account...</p>
            </div>
          );
      }
    }

    // Show login/register forms for unauthenticated users
    if (authState === AUTH_STATES.UNAUTHENTICATED || !authState) {
      return isLogin ? (
        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
      );
    }

    // Loading state
    return (
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen gradient-primary-br flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section - Always visible */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
            <Palette className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Tabletop Tactica</h1>
          <p className="text-indigo-100">Your paint collection & project manager</p>
        </div>

        {/* Auth Form Container */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <ErrorBoundary fallbackType="auth">
            {renderContent()}
          </ErrorBoundary>
        </div>

        {/* Footer - Only show for login/register, not during onboarding */}
        {(authState === AUTH_STATES.UNAUTHENTICATED || !authState) && !showUnderAgeNotice && (
          <div className="text-center mt-8">
            <p className="text-indigo-100 text-sm">
              © 2024 Tabletop Tactica. Built for miniature painters.
            </p>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <a
                href="/privacy-policy"
                target="_blank"
                className="text-indigo-200 hover:text-white"
              >
                Privacy Policy
              </a>
              <a
                href="/terms-of-service"
                target="_blank"
                className="text-indigo-200 hover:text-white"
              >
                Terms of Service
              </a>
              <a
                href="/support"
                target="_blank"
                className="text-indigo-200 hover:text-white"
              >
                Support
              </a>
            </div>
          </div>
        )}

        {/* Onboarding Progress Indicator */}
        {authState === AUTH_STATES.AUTHENTICATED_NEEDS_ONBOARDING && !showUnderAgeNotice && (
          <div className="mt-6">
            <div className="text-center mb-3">
              <p className="text-indigo-100 text-sm">Account Setup Progress</p>
            </div>
            <div className="flex justify-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                ['age-verification', 'privacy-consent', 'tier-selection'].includes(onboardingStep) 
                  ? 'bg-green-400' 
                  : 'bg-white/30'
              }`} />
              <div className={`w-3 h-3 rounded-full ${
                ['privacy-consent', 'tier-selection'].includes(onboardingStep) 
                  ? 'bg-green-400' 
                  : onboardingStep === 'age-verification' 
                  ? 'bg-indigo-400' 
                  : 'bg-white/30'
              }`} />
              <div className={`w-3 h-3 rounded-full ${
                onboardingStep === 'tier-selection' 
                  ? 'bg-indigo-400' 
                  : ['age-verification', 'privacy-consent'].includes(onboardingStep)
                  ? 'bg-white/30'
                  : 'bg-green-400'
              }`} />
            </div>
            <div className="flex justify-between text-xs text-indigo-200 mt-2 px-1">
              <span>Age</span>
              <span>Privacy</span>
              <span>Plan</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;