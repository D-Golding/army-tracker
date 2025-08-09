// components/landing/LandingNav.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, Menu, X } from 'lucide-react';

const LandingNav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container-mobile">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 gradient-primary-br rounded-lg">
              <Palette className="text-white" size={20} />
            </div>
            <span className="text-lg font-bold text-gray-900">Tabletop Tactica</span>
          </div>

          {/* Mobile Get Started Button */}
          <div className="flex items-center gap-2">
            <Link to="/auth" className="btn-primary btn-sm">
              Sign in
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-white py-3">
            <div className="flex flex-col gap-3">
              <a href="#features" className="text-gray-600 hover:text-gray-900 px-2 py-1">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 px-2 py-1">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 px-2 py-1">Reviews</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LandingNav;