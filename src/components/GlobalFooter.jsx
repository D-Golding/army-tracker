// components/GlobalFooter.jsx - Global footer for all pages
import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Youtube, Mail, Shield } from 'lucide-react';

const GlobalFooter = () => {
  const currentYear = new Date().getFullYear();

  const legalLinks = [
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Terms of Service', path: '/terms-of-service' },
    { label: 'Cookie Policy', path: '/cookie-policy' },
    { label: 'Support', path: '/support' }
  ];

  const socialLinks = [
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Youtube, label: 'YouTube', href: '#' }
  ];

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-md mx-auto px-4 py-6 lg:max-w-6xl lg:px-8">

        {/* Main Footer Content */}
        <div className="space-y-6 lg:grid lg:grid-cols-4 lg:gap-8 lg:space-y-0">

          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={24} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Tabletop Tactica
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your ultimate companion for miniature painting and tabletop gaming projects.
            </p>

            {/* Social Media Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
  <a
    key={social.label}
    href={social.href}
    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
    aria-label={social.label}
  >
                    <IconComponent size={16} className="text-gray-600 dark:text-gray-400" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/app"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Paint Inventory
                </Link>
              </li>
              <li>
                <Link
                  to="/app/projects"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  to="/app/dashboard"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Contact
            </h3>
            <div className="space-y-2">
              <a
                href="mailto:support@tabletoptactica.com"
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Mail size={14} />
                Support
              </a>
              <a
                href="mailto:privacy@tabletoptactica.com"
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Shield size={14} />
                Privacy
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center gap-3 lg:flex-row lg:justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center lg:text-left">
              © {currentYear} Tabletop Tactica. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>Made with ❤️ for painters</span>
              <span className="hidden lg:inline">•</span>
              <span className="badge-tertiary">v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Tabletop Tactica is not affiliated with Games Workshop, Citadel, or any other miniature manufacturers.
            All product names and trademarks are property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;