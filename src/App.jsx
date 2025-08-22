// App.jsx - Fixed admin blog routing with R2TestPage added
import React, { useEffect, Suspense, lazy } from 'react';
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
import PaymentForm from './components/payment/PaymentForm';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import NotificationManager from './components/NotificationManager';
import AccountRecovery from './components/AccountRecovery';
import GlobalFooter from './components/GlobalFooter';

// IMMEDIATE IMPORTS (load right away)
// Community/Newsfeed - keep instant since it's the main landing page
import CommunityPage from './pages/CommunityPage';

// LAZY IMPORTS (load only when needed) - DATA COST OPTIMIZATION
const PaintList = lazy(() => import('./components/paints/PaintList'));
const ProjectList = lazy(() => import('./components/projects/ProjectList'));
const ProjectDetailView = lazy(() => import('./components/projects/ProjectDetailView'));
const AddProjectPage = lazy(() => import('./pages/AddProjectPage'));
const AddStepPage = lazy(() => import('./pages/AddStepPage'));
const AddPhotosPage = lazy(() => import('./pages/AddPhotosPage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const UserDashboardLayout = lazy(() => import('./components/dashboard/UserDashboardLayout'));
const CreatePostPage = lazy(() => import('./pages/CreatePostPage'));
const MyPostsPage = lazy(() => import('./pages/MyPostsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogAdmin = lazy(() => import('./components/admin/BlogAdmin'));
const BlogEditor = lazy(() => import('./components/blog/BlogEditor'));
const R2TestPage = lazy(() => import('./pages/R2TestPage'));

// Loading Spinner Component for Lazy Loading
const LazyLoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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

      {/* R2 Test Route - TESTING ONLY */}
      <Route
        path="/r2-test"
        element={
          <Suspense fallback={<LazyLoadingSpinner />}>
            <R2TestPage />
          </Suspense>
        }
      />

      {/* Account Recovery Route - Public, no auth required */}
      <Route path="/account-recovery" element={<AccountRecovery />} />

      {/* Auth Route - Smart routing based on auth state */}
      <Route
        path="/auth"
        element={
          authState === AUTH_STATES.AUTHENTICATED_COMPLETE ? (
            // CHANGED: send authenticated users to Community by default
            <Navigate to="/app/community" replace />
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
            // CHANGED: send authenticated users to Community by default
            <Navigate to="/app/community" replace />
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
        {/* Keep Paints as the index so existing menu links to /app still work */}
        <Route
          index
          element={
            <Suspense fallback={<LazyLoadingSpinner />}>
              <PaintList />
            </Suspense>
          }
        />

        {/* Projects Routes - LAZY LOADED */}
        <Route
          path="projects"
          element={
            <Suspense fallback={<LazyLoadingSpinner />}>
              <ProjectList />
            </Suspense>
          }
        />
        <Route
          path="projects/new"
          element={
            <Suspense fallback={<LazyLoadingSpinner />}>
              <AddProjectPage />
            </Suspense>
          }
        />
        <Route
          path="projects/:projectId"
          element={
            <Suspense fallback={<LazyLoadingSpinner />}>
              <ProjectDetailView />
            </Suspense>
          }
        />
        <Route
          path="projects/:projectId/steps/new"
          element={
            <Suspense fallback={<LazyLoadingSpinner />}>
              <AddStepPage />
            </Suspense>
          }
        />
        <Route
          path="projects/:projectId/photos/new"
          element={
            <Suspense fallback={<LazyLoadingSpinner />}>
              <AddPhotosPage />
            </Suspense>
          }
        />

        {/* Community Routes - News Feed System (IMMEDIATE LOADING) */}
        <Route
          path="community"
          element={
            <ProtectedRoute requiresCommunityAccess={true}>
              <CommunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="community/create"
          element={
            <ProtectedRoute requiresCommunityAccess={true}>
              <Suspense fallback={<LazyLoadingSpinner />}>
                <CreatePostPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="community/my-posts"
          element={
            <ProtectedRoute requiresCommunityAccess={true}>
              <Suspense fallback={<LazyLoadingSpinner />}>
                <MyPostsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Blog Routes - LAZY LOADED */}
        <Route
          path="blog/*"
          element={
            <Suspense fallback={<LazyLoadingSpinner />}>
              <BlogPage />
            </Suspense>
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

        {/* Dashboard Route - LAZY LOADED */}
        <Route
          path="dashboard/*"
          element={
            <Suspense fallback={<LazyLoadingSpinner />}>
              <UserDashboardLayout />
            </Suspense>
          }
        />
      </Route>

      {/* Protected Admin Routes - LAZY LOADED */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Main Admin Dashboard */}
        <Route
          index
          element={
            <Suspense fallback={<LazyLoadingSpinner />}>
              <AdminDashboard />
            </Suspense>
          }
        />

        {/* Separate Blog Admin Routes - FIXED */}
        <Route
          path="blog"
          element={
            <Suspense fallback={<LazyLoadingSpinner />}>
              <BlogAdmin />
            </Suspense>
          }
        />
        <Route
          path="blog/new"
          element={
            <Suspense fallback={<LazyLoadingSpinner />}>
              <BlogEditor mode="create" />
            </Suspense>
          }
        />
        <Route
          path="blog/edit/:postId"
          element={
            <Suspense fallback={<LazyLoadingSpinner />}>
              <BlogEditor mode="edit" />
            </Suspense>
          }
        />
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
};

export default App;