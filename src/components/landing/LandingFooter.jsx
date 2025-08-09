// components/landing/LandingFooter.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Palette } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container-mobile">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 gradient-primary-br rounded-lg">
              <Palette className="text-white" size={20} />
            </div>
            <span className="text-lg font-bold">Tabletop Tactica</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            The ultimate paint collection and project management tool for miniature painters.
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="font-semibold mb-3 text-sm">Product</h4>
            <div className="space-y-2">
              <a href="#features" className="block text-gray-400 hover:text-white transition-colors text-sm">Features</a>
              <a href="#pricing" className="block text-gray-400 hover:text-white transition-colors text-sm">Pricing</a>
              <Link to="/auth" className="block text-gray-400 hover:text-white transition-colors text-sm">Sign Up</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Support</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">Help Center</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">Contact</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
            </div>
          </div>
        </div>

        <div className="text-center border-t border-gray-700 pt-6">
          <p className="text-xs text-gray-500">
            © 2024 Tabletop Tactica. Built for miniature painters.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;