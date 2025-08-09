// components/common/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error for future analytics/monitoring integration
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Future: Send to error reporting service
    // this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // Placeholder for future error reporting integration (Sentry, etc.)
    // For now, just console log in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Report');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isAuthError = this.props.fallbackType === 'auth';
      const isDataError = this.props.fallbackType === 'data';

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="card-base card-padding-lg">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isAuthError ? 'Authentication Error' :
                 isDataError ? 'Loading Error' :
                 'Something went wrong'}
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isAuthError ?
                  "We're having trouble with your account. Please try signing in again." :
                 isDataError ?
                  "We couldn't load your data. Please check your connection and try again." :
                  "An unexpected error occurred. Our team has been notified and we're working on a fix."
                }
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                    Development Error Details:
                  </h3>
                  <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={this.state.retryCount >= 3}
                >
                  <RefreshCw className="w-4 h-4" />
                  {this.state.retryCount >= 3 ? 'Too many retries' : 'Try Again'}
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>

              {this.state.retryCount >= 3 && (
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Still having trouble? Contact our{' '}
                  <a
                    href="mailto:support@tabletoptactica.com"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    support team
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;