// components/common/ConfirmationModal.jsx - Nice Confirmation Modal
import React from 'react';
import { Check, AlertTriangle, X, ArrowRight } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'success', // 'success', 'warning', 'error', 'info'
  showActions = true,
  primaryAction = null,
  secondaryAction = null,
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  // Auto close if enabled
  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Get type-specific styling
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: Check,
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/20',
          borderColor: 'border-emerald-200 dark:border-emerald-800',
          titleColor: 'text-emerald-900 dark:text-emerald-100'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-600 dark:text-amber-400',
          iconBg: 'bg-amber-100 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          titleColor: 'text-amber-900 dark:text-amber-100'
        };
      case 'error':
        return {
          icon: X,
          iconColor: 'text-red-600 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          titleColor: 'text-red-900 dark:text-red-100'
        };
      default: // info
        return {
          icon: AlertTriangle,
          iconColor: 'text-blue-600 dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          titleColor: 'text-blue-900 dark:text-blue-100'
        };
    }
  };

  const typeConfig = getTypeConfig();
  const IconComponent = typeConfig.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={`
          relative w-full max-w-md mx-auto
          bg-white dark:bg-gray-800 
          rounded-2xl shadow-2xl 
          border ${typeConfig.borderColor}
          transform transition-all duration-200 ease-out
          animate-in zoom-in-95 fade-in
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
        </button>

        {/* Modal content */}
        <div className="p-6">
          {/* Icon and title */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${typeConfig.iconBg} flex items-center justify-center`}>
              <IconComponent className={`w-6 h-6 ${typeConfig.iconColor}`} />
            </div>

            <div className="flex-1 pt-1">
              <h3 className={`text-lg font-semibold ${typeConfig.titleColor} mb-2`}>
                {title}
              </h3>

              <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {typeof message === 'string' ? (
                  <p>{message}</p>
                ) : (
                  message
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (primaryAction || secondaryAction) && (
            <div className="flex gap-3 mt-6">
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  className={`
                    flex-1 btn-md flex items-center justify-center gap-2
                    ${primaryAction.variant === 'danger' ? 'btn-danger' :
                      primaryAction.variant === 'secondary' ? 'btn-secondary' :
                      'btn-primary'
                    }
                  `}
                >
                  {primaryAction.icon && <primaryAction.icon className="w-5 h-5" />}
                  {primaryAction.label}
                </button>
              )}

              {secondaryAction && (
                <button
                  onClick={secondaryAction.onClick}
                  disabled={secondaryAction.disabled}
                  className="flex-1 btn-outline btn-md flex items-center justify-center gap-2"
                >
                  {secondaryAction.icon && <secondaryAction.icon className="w-5 h-5" />}
                  {secondaryAction.label}
                </button>
              )}
            </div>
          )}

          {/* Auto-close indicator */}
          {autoClose && isOpen && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Closing automatically in {Math.ceil(autoCloseDelay / 1000)} seconds...
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-2 overflow-hidden">
                <div
                  className="h-full bg-gray-400 dark:bg-gray-500 rounded-full transition-all ease-linear"
                  style={{
                    animation: `shrink ${autoCloseDelay}ms linear forwards`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auto-close animation styles */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-in {
          animation: animate-in 0.2s ease-out;
        }
        
        .zoom-in-95 {
          animation: animate-in 0.2s ease-out;
        }
        
        .fade-in {
          animation: animate-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;