// components/landing/HeroSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="gradient-primary-br text-white px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-16 translate-x-16 transform"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-12 -translate-x-12 transform"></div>

      <div className="container-mobile text-center relative z-10">
        <h1 className="text-3xl font-bold mb-4 leading-tight">
          Your Paint Collection,
          <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            Perfectly Organised
          </span>
        </h1>

        <p className="text-lg text-indigo-100 mb-6 leading-relaxed">
          Stop losing track of your miniature paints. Tabletop Tactica helps you manage your collection and never run out of colours.
        </p>

        <div className="space-y-3 mb-8">
          <Link to="/auth" className="btn-lg w-full py-4 px-6 bg-white text-indigo-600 font-semibold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
            Get Started Free
            <ArrowRight size={18} />
          </Link>

          <a href="#pricing" className="btn-outline-primary btn-lg w-full py-4 px-6 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all block text-center">
            View Pricing
          </a>
        </div>

        <div className="text-indigo-100">
          <div className="flex justify-center items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className="fill-yellow-300 text-yellow-300" />
            ))}
          </div>
          <p className="text-sm">Trusted by 2,500+ painters worldwide</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;