// App.jsx - Professional Navigation with Authentication States, Error Boundaries, and React Query
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LandingPage from './components/LandingPage';
import AuthPage from './components/auth/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';
import PaintList from './components/PaintList';
import ProjectList from "./components/projects/ProjectList";
import ProjectDetailView from './components/projects/ProjectDetailView';
import AdminDashboard from './components/AdminDashboard';
import PaymentForm from './components/payment/PaymentForm';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import NotificationManager from './components/NotificationManager';

// Import Dashboard Components
import UserDashboardLayout from './components/dashboard/UserDashboardLayout';
import ProfileInfo from './components/dashboard/Profile/ProfileInfo';

// Dashboard Section Components
const DashboardProfile = () => <ProfileInfo />;

const DashboardPrivacy = () => (
  <div className="space-y-6">
    <div className="card-base card-padding-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Privacy Settings
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        This is where the ConsentManager, MailingPreferences, and PrivacySettings components will be displayed.
      </p>
    </div>
  </div>
);

const DashboardSubscription = () => (
  <div className="space-y-6">
    <div className="card-base card-padding-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Subscription Management
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        This is where the TierOverview, UsageAnalytics, and BillingInfo components will be displayed.
      </p>
    </div>
  </div>
);

const DashboardAchievements = () => (
  <div className="space-y-6">
    <div className="card-base card-padding-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Achievements & Progress
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        This is where the AchievementGallery, ProgressBars, StatsOverview, and StreakManager components will be displayed.
      </p>
    </div>
  </div>
);

const DashboardActivity = () => (
  <div className="space-y-6">
    <div className="card-base card-padding-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Activity & Data
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        This is where the ActivityTimeline, ProjectAnalytics, DataExport, NotificationCenter, and EmailPreferences components will be displayed.
      </p>
    </div>
  </div>
);

// Main App Router Component
const AppRouter = () => {
  const { authState, isLoading, AUTH_STATES } = useAuth();

  // Show loading screen during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Tabletop Tactica
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Setting up your workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Route - Smart routing based on auth state */}
      <Route
        path="/auth"
        element={
          authState === AUTH_STATES.AUTHENTICATED_COMPLETE ? (
            <Navigate to="/app" replace />
          ) : (
            <AuthPage />
          )
        }
      />

      {/* Forgot Password Route */}
      <Route
        path="/forgot-password"
        element={
          authState === AUTH_STATES.AUTHENTICATED_COMPLETE ? (
            <Navigate to="/app" replace />
          ) : (
            <ForgotPasswordPage />
          )
        }
      />

      {/* Payment Route - Protected but allows authenticated users during onboarding */}
      <Route
        path="/payment"
        element={
          authState === AUTH_STATES.UNAUTHENTICATED ? (
            <Navigate to="/auth" replace />
          ) : (
            <PaymentForm />
          )
        }
      />

      {/* Protected App Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PaintList />} />
        <Route path="projects" element={<ProjectList />} />
        <Route path="projects/:projectId" element={<ProjectDetailView />} />

        {/* Future Community Routes (with appropriate protection) */}
        <Route
          path="community/*"
          element={
            <ProtectedRoute requiresCommunityAccess={true}>
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Community Features Coming Soon</h2>
                <p className="text-gray-600">Community features are in development!</p>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Messaging Route (Adults only) */}
        <Route
          path="messages/*"
          element={
            <ProtectedRoute requiresFeature="messaging">
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Messaging Coming Soon</h2>
                <p className="text-gray-600">Direct messaging features are in development!</p>
              </div>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route
        path="/app/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Default dashboard route redirects to profile */}
        <Route index element={<Navigate to="/app/dashboard/profile" replace />} />

        {/* Dashboard section routes */}
        <Route path="profile" element={<DashboardProfile />} />
        <Route path="privacy" element={<DashboardPrivacy />} />
        <Route path="subscription" element={<DashboardSubscription />} />
        <Route path="achievements" element={<DashboardAchievements />} />
        <Route path="activity" element={<DashboardActivity />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
      </Route>

      {/* Privacy Policy & Legal Pages (accessible to all) */}
      <Route
        path="/privacy-policy"
        element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
              <div className="card-base card-padding-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  Privacy policy content coming soon. We are committed to protecting your privacy and complying with GDPR, COPPA, and other international privacy laws.
                </p>
              </div>
            </div>
          </div>
        }
      />

      <Route
        path="/terms-of-service"
        element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
              <div className="card-base card-padding-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  Terms of service content coming soon.
                </p>
              </div>
            </div>
          </div>
        }
      />

      <Route
        path="/cookie-policy"
        element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
              <div className="card-base card-padding-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  Cookie policy content coming soon.
                </p>
              </div>
            </div>
          </div>
        }
      />

      {/* Support/Contact Page */}
      <Route
        path="/support"
        element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">Support & Contact</h1>
              <div className="card-base card-padding-lg">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Get Help</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Need assistance? Contact our support team:
                    </p>
                    <a
                      href="mailto:support@tabletoptactica.com"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      support@tabletoptactica.com
                    </a>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-2">Data Protection</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      For data protection queries or to exercise your rights under GDPR:
                    </p>
                    <a
                      href="mailto:privacy@tabletoptactica.com"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      privacy@tabletoptactica.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      />

      {/* Catch all - redirect unknown routes to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component with Error Boundaries and React Query
function App() {
  return (
    <ErrorBoundary fallbackType="app">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <ErrorBoundary fallbackType="auth">
              <AppRouter />
            </ErrorBoundary>

            {/* Global Notification Manager - handles all achievements and confirmations */}
            <NotificationManager />
          </Router>
        </AuthProvider>
        {/* React Query DevTools - only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;