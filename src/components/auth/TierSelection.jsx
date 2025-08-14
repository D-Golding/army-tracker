// components/auth/TierSelection.jsx - Dynamic pricing with subscription config
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { tiers, getCurrencyInfo } from '../../config/subscription';
import LaunchNotificationSignup from '../common/LaunchNotificationSignup';

const TierSelection = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(1); // Start with Casual (popular)
  const [loading, setLoading] = useState(false);
  const { completeTierSelection, cancelOnboarding } = useAuth();
  const navigate = useNavigate();

  // Get currency info
  const { code: currency, symbol: currencySymbol } = getCurrencyInfo();

  const handleCancel = async () => {
    try {
      await cancelOnboarding();
      navigate('/');
    } catch (error) {
      console.error('Error canceling onboarding:', error);
      // Still navigate even if cancel fails
      navigate('/');
    }
  };

  const handleTierSelect = async (tierId) => {
    setLoading(true);

    try {
      // If free tier, complete selection immediately
      if (tierId === 'free') {
        await completeTierSelection(tierId);
        onComplete?.();
        return;
      }

      // For paid tiers, redirect to payment page
      const paymentUrl = `/payment?tier=${tierId}&currency=${currency}`;
      navigate(paymentUrl);

    } catch (error) {
      console.error('Error selecting tier:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToSlide = (index) => {
    if (index < 0) index = tiers.length - 1;
    if (index >= tiers.length) index = 0;
    setCurrentIndex(index);
  };

  const nextSlide = () => goToSlide(currentIndex + 1);
  const prevSlide = () => goToSlide(currentIndex - 1);

  const currentTier = tiers[currentIndex];
  const IconComponent = currentTier.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Plan
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          Select the tier that best fits your hobby needs
        </p>
      </div>

      {/* Tier Card */}
      <div className="w-full max-w-sm mx-auto">
        <div className={`card-base border-2 border-white ${currentTier.bgColor} relative overflow-hidden`}>
          {/* Popular Badge */}
          {currentTier.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
              <span className="badge-blue text-xs font-semibold px-3 py-1 rounded-full">
                POPULAR
              </span>
            </div>
          )}

          <div className="card-padding-lg">
            {/* Header */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${currentTier.color} mb-4`}>
                <IconComponent className="text-white" size={28} />
              </div>
              <h3 className={`text-xl font-bold ${currentTier.textColor} mb-2`}>
                {currentTier.name}
              </h3>
              <div className="mb-4">
                <span className={`text-3xl font-bold ${currentTier.textColor}`}>
                  {currentTier.priceDisplay}
                </span>
                {currentTier.id !== 'free' && (
                  <span className={`text-sm ${currentTier.textColor} opacity-70 ml-1`}>
                    /{currentTier.period}
                  </span>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {currentTier.featureList.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0 mt-1" size={16} />
                  <span className={`text-sm ${currentTier.textColor} opacity-80`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Coming Soon Notice and Email Signup for Paid Tiers */}
            {currentTier.id !== 'free' && (
              <LaunchNotificationSignup
                key={`signup-${currentTier.id}`}
                title="🚀 Coming Soon!"
                description="We're putting the finishing touches on our premium features! If you've been invited to take part in our feature testing, select your plan and enter your invitation code on the payment page."
                className="mt-4"
                tier={currentTier.id}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6 px-4">
          <button onClick={prevSlide} className="btn-icon">
            <ChevronLeft className="text-gray-600 dark:text-gray-400" size={24} />
          </button>

          {/* Dots Indicator */}
          <div className="flex gap-2">
            {tiers.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={
                  index === currentIndex ? 'carousel-dot-active' : 'carousel-dot-inactive'
                }
              />
            ))}
          </div>

          <button onClick={nextSlide} className="btn-icon">
            <ChevronRight className="text-gray-600 dark:text-gray-400" size={24} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm mx-auto space-y-3">
        <button
          onClick={() => handleTierSelect(currentTier.id)}
          disabled={loading}
          className={`btn-lg w-full ${currentTier.color} text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50`}
        >
          {loading ? (
            <>
              <div className="loading-spinner" />
              Setting up...
            </>
          ) : currentTier.id === 'free' ? (
            `Continue with ${currentTier.name}`
          ) : (
            `Select ${currentTier.name} Plan`
          )}
        </button>

        <button
          onClick={handleCancel}
          disabled={loading}
          className="btn-secondary w-full"
        >
          <X size={16} />
          Cancel
        </button>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 text-xs">
          You can upgrade or downgrade at any time from your account settings
        </p>
      </div>
    </div>
  );
};

export default TierSelection;