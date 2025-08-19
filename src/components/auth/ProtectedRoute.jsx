// components/auth/ProtectedRoute.jsx - Enhanced Route Protection with Community Access
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Shield, User, Settings, Crown } from 'lucide-react';

const ProtectedRoute = ({
  children,
  adminOnly = false,
  requiresCommunityAccess = false,
  requiresFeature = null
}) => {
  const {
    authState,
    currentUser,
    userProfile,
    isLoading,
    hasFeatureAccess,
    hasCommunityAccess,
    AUTH_STATES
  } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading || authState === AUTH_STATES.LOADING) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!currentUser || authState === AUTH_STATES.UNAUTHENTICATED) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect if user needs onboarding
  if (authState === AUTH_STATES.AUTHENTICATED_NEEDS_ONBOARDING) {
    return <Navigate to="/auth" replace />;
  }

  // Check for admin access if required
  if (adminOnly && userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card-base card-padding-lg text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You don't have permission to access this area.
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check for community access if required (Enhanced for friend system)
  if (requiresCommunityAccess && !hasCommunityAccess()) {
    const isMinor = userProfile?.userCategory === 'minor';

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card-base card-padding-lg text-center">
            <Users className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isMinor ? 'Community Not Available' : 'Community Access Required'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isMinor
                ? "Community features including friends, groups, and messaging are not available for users under 18 for safety reasons."
                : "You need to enable community access in your privacy settings to use friend features and connect with other painters."
              }
            </p>

            {!isMinor ? (
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/app/dashboard/privacy'}
                  className="btn-primary w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Update Privacy Settings
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="btn-tertiary w-full"
                >
                  Go Back
                </button>
              </div>
            ) : (
              <button
                onClick={() => window.history.back()}
                className="btn-primary"
              >
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Check for specific feature access if required (Enhanced messaging)
  if (requiresFeature && !hasFeatureAccess(requiresFeature)) {
    const isMinor = userProfile?.userCategory === 'minor';

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card-base card-padding-lg text-center">
            <User className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Feature Not Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isMinor
                ? `This feature is not available for users under 18.`
                : `You don't have access to the ${requiresFeature} feature.`
              }
            </p>

            {!isMinor && requiresFeature === 'messaging' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <Crown className="w-4 h-4 inline mr-1" />
                  Upgrade your subscription to access direct messaging with friends.
                </p>
              </div>
            )}

            <button
              onClick={() => window.history.back()}
              className="btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has access, render the protected content
  return children;
};

export default ProtectedRoute;