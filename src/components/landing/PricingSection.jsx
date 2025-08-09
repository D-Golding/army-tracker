// components/landing/PricingSection.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { tiers } from '../../data/tierData';
import { getTierPricing, getCurrencyInfo } from '../../config/subscriptionConfig';
import LaunchNotificationSignup from '../common/LaunchNotificationSignup';

const PricingSection = () => {
  const [currentTierIndex, setCurrentTierIndex] = useState(1); // Start with Casual (popular)

  // Get currency info
  const { currency, symbol: currencySymbol } = getCurrencyInfo();

  const goToSlide = (index) => {
    if (index < 0) index = tiers.length - 1;
    if (index >= tiers.length) index = 0;
    setCurrentTierIndex(index);
  };

  const nextSlide = () => goToSlide(currentTierIndex + 1);
  const prevSlide = () => goToSlide(currentTierIndex - 1);

  const currentTier = tiers[currentTierIndex];
  const IconComponent = currentTier.icon;
  const tierPricing = getTierPricing(currentTier.id);

  return (
    <section id="pricing" className="py-16 bg-gray-50 px-4">
      <div className="container-mobile">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Choose Your Perfect Plan
          </h2>
          <p className="text-gray-600">
            Start free and upgrade as your collection grows
          </p>
        </div>

        {/* Mobile Pricing Carousel */}
        <div className="mb-8">
          <div className={`card-base border-2 border-gray-200 shadow-lg ${currentTier.bgColor} relative overflow-hidden`}>
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
                    {currentTier.id === 'free' ? 'Free' : `${currencySymbol}${tierPricing.price.toFixed(2)}`}
                  </span>
                  {currentTier.id !== 'free' && (
                    <span className={`text-sm ${currentTier.textColor} opacity-70 ml-1`}>
                      /year
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {currentTier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-1" size={16} />
                    <span className={`text-sm ${currentTier.textColor} opacity-80`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Launch Notification Signup for Paid Tiers */}
              {currentTier.id !== 'free' && (
                <LaunchNotificationSignup
                  key={`landing-signup-${currentTier.id}`}
                  title="🚀 Coming Soon!"
                  description="Be the first to know when premium features launch and get early access!"
                  className="mb-4"
                  tier={currentTier.id}
                />
              )}

              {/* CTA Button */}
              <Link
                to="/auth"
                className={`btn-lg w-full ${currentTier.color} text-white font-semibold rounded-xl hover:shadow-lg transition-all block text-center py-4`}
              >
                {currentTier.id === 'free' ? 'Get Started Free' : 'Start Free Trial'}
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6 px-4">
            <button onClick={prevSlide} className="carousel-nav-button">
              <ChevronLeft className="text-gray-600" size={20} />
            </button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {tiers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={
                    index === currentTierIndex ? 'carousel-dot-active' : 'carousel-dot-inactive'
                  }
                />
              ))}
            </div>

            <button onClick={nextSlide} className="carousel-nav-button">
              <ChevronRight className="text-gray-600" size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;