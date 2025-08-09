// components/auth/ForgotPasswordPage.jsx - Standalone Password Reset Page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette } from 'lucide-react';
import PasswordReset from './PasswordReset';
import ErrorBoundary from '../common/ErrorBoundary';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/auth');
  };

  const handleResetSuccess = (email) => {
    // Could track analytics here
    console.log('Password reset sent to:', email);
  };

  return (
    <div className="min-h-screen gradient-primary-br flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
            <Palette className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Tabletop Tactica</h1>
          <p className="text-indigo-100">Reset your password</p>
        </div>

        {/* Password Reset Form Container */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <ErrorBoundary fallbackType="auth">
            <PasswordReset
              onBack={handleBackToLogin}
              onSuccess={handleResetSuccess}
              variant="standalone"
            />
          </ErrorBoundary>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-indigo-100 text-sm">
            © 2024 Tabletop Tactica. Built for miniature painters.
          </p>
          <div className="flex justify-center gap-4 mt-2 text-xs">
            <a
              href="/support"
              target="_blank"
              className="text-indigo-200 hover:text-white"
            >
              Need Help?
            </a>
            <a
              href="/privacy-policy"
              target="_blank"
              className="text-indigo-200 hover:text-white"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;