// components/LandingPage.jsx - Refactored with design system and components
import React from 'react';
import LandingNav from './landing/LandingNav';
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import PricingSection from './landing/PricingSection';
import TestimonialsSection from './landing/TestimonialsSection';
import CTASection from './landing/CTASection';
import LandingFooter from './landing/LandingFooter';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;