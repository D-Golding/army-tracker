// components/auth/ProtectedRoute.jsx - Enhanced Route Protection with Age-based Access
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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

  // Check for admin access if required
  if (adminOnly && userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="card-base card-padding-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You don't have permission to access this area.
            </p>
            <Navigate to="/app" replace />
          </div>
        </div>
      </div>
    );
  }

  // Check for community access if required
  if (requiresCommunityAccess && !hasCommunityAccess()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="card-base card-padding-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Community Access Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {userProfile?.userCategory === 'minor'
                ? "Community features are not available for users under 18 for safety reasons."
                : "You need to enable community access in your privacy settings to use this feature."
              }
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

  // Check for specific feature access if required
  if (requiresFeature && !hasFeatureAccess(requiresFeature)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="card-base card-padding-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Feature Not Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This feature is not available with your current account settings.
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

  // User is authenticated and has access, render the protected content
  return children;
};

export default ProtectedRoute;