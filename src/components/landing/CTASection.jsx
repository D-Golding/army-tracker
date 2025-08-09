// components/landing/CTASection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-16 gradient-primary-br text-white px-4">
      <div className="container-mobile text-center">
        <h2 className="text-2xl font-bold mb-4 leading-tight">
          Ready to Organise Your Paint Collection?
        </h2>
        <p className="text-indigo-100 mb-6 leading-relaxed">
          Join thousands of painters who've transformed their hobby with Tabletop Tactica
        </p>

        <Link
          to="/auth"
          className="btn-lg w-full py-4 px-6 bg-white text-indigo-600 font-semibold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          Start Your Free Account
          <ArrowRight size={18} />
        </Link>

        <p className="mt-4 text-sm text-indigo-100">
          No credit card required • Cancel anytime
        </p>
      </div>
    </section>
  );
};

export default CTASection;