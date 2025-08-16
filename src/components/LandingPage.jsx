// components/LandingPage.jsx - Refactored with design system and GlobalFooter
import React from 'react';
import LandingNav from './landing/LandingNav';
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import PricingSection from './landing/PricingSection';
import TestimonialsSection from './landing/TestimonialsSection';
import CTASection from './landing/CTASection';
import LandingFooter from './landing/LandingFooter';
import GlobalFooter from './GlobalFooter';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LandingNav />
      <div className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
        <LandingFooter />
      </div>
      <GlobalFooter />
    </div>
  );
};

export default LandingPage;