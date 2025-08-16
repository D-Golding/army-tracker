// App.jsx - Professional Navigation with Authentication States, Error Boundaries, and React Query
import React, { useEffect } from 'react';
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
import PaintList from './components/paints/PaintList';
import ProjectList from "./components/projects/ProjectList";
import ProjectDetailView from './components/projects/ProjectDetailView';
import AddProjectPage from './pages/AddProjectPage';
import AddStepPage from './pages/AddStepPage';
import AddPhotosPage from './pages/AddPhotosPage';
import AdminDashboard from './components/AdminDashboard';
import PaymentForm from './components/payment/PaymentForm';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import NotificationManager from './components/NotificationManager';
import AccountRecovery from './components/AccountRecovery';
import GlobalFooter from './components/GlobalFooter';

// Import Dashboard Layout (the real one)
import UserDashboardLayout from './components/dashboard/UserDashboardLayout';


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

      {/* Account Recovery Route - Public, no auth required */}
      <Route path="/account-recovery" element={<AccountRecovery />} />

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
        <Route path="projects/new" element={<AddProjectPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailView />} />
        <Route path="projects/:projectId/steps/new" element={<AddStepPage />} />
        <Route path="projects/:projectId/photos/new" element={<AddPhotosPage />} />

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

        {/* Dashboard Route - Use your working UserDashboardLayout */}
        <Route
          path="dashboard/*"
          element={<UserDashboardLayout />}
        />
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
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <div className="flex-1 p-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
                <div className="card-base card-padding-lg">
                  <p className="text-gray-600 dark:text-gray-400">
                    Privacy policy content coming soon. We are committed to protecting your privacy and complying with GDPR, COPPA, and other international privacy laws.
                  </p>
                </div>
              </div>
            </div>
            <GlobalFooter />
          </div>
        }
      />

      <Route
        path="/terms-of-service"
        element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <div className="flex-1 p-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
                <div className="card-base card-padding-lg">
                  <p className="text-gray-600 dark:text-gray-400">
                    Terms of service content coming soon.
                  </p>
                </div>
              </div>
            </div>
            <GlobalFooter />
          </div>
        }
      />

      <Route
        path="/cookie-policy"
        element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <div className="flex-1 p-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
                <div className="card-base card-padding-lg">
                  <p className="text-gray-600 dark:text-gray-400">
                    Cookie policy content coming soon.
                  </p>
                </div>
              </div>
            </div>
            <GlobalFooter />
          </div>
        }
      />

      {/* Support/Contact Page */}
      <Route
        path="/support"
        element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <div className="flex-1 p-8">
              <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Support & Contact</h1>
                <div className="card-base card-padding-lg">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Get Help</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Need assistance? Contact our support team:
                      </p>
                      <a href="mailto:support@tabletoptactica.com"
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
                      <a href="mailto:privacy@tabletoptactica.com"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        privacy@tabletoptactica.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <GlobalFooter />
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