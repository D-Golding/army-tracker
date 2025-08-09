// components/landing/FeaturesSection.jsx
import React from 'react';
import { Palette, Folder, BarChart3, Users } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Palette,
      title: 'Smart Paint Tracking',
      description: 'Never run out of paint again. Track your entire collection with usage levels and automatic restock reminders.'
    },
    {
      icon: Folder,
      title: 'Project Management',
      description: 'Organise your miniature projects with paint requirements, photos, and progress tracking from concept to completion.'
    },
    {
      icon: BarChart3,
      title: 'Usage Analytics',
      description: 'See which paints you use most, track your hobby progress, and optimise your paint collection.'
    },
    {
      icon: Users,
      title: 'Community Sharing',
      description: 'Share your projects with fellow painters, get inspired by the community, and discover new techniques.'
    }
  ];

  return (
    <section id="features" className="py-16 bg-white px-4">
      <div className="container-mobile">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Everything You Need to Master Your Hobby
          </h2>
          <p className="text-gray-600">
            From paint tracking to project management, we've got you covered.
          </p>
        </div>

        <div className="space-y-8">
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 gradient-primary-br text-white rounded-xl mb-4">
                  <FeatureIcon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;