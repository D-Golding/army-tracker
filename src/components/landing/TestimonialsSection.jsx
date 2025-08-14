// components/landing/TestimonialsSection.jsx
import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Warhammer 40K Player',
      content: 'Finally, I can keep track of all my Citadel Paints paints and never buy duplicates again!',
      rating: 5
    },
    {
      name: 'Marcus T.',
      role: 'D&D Enthusiast',
      content: 'The project tracking feature is brilliant. I can see exactly what paints I need for each mini.',
      rating: 5
    },
    {
      name: 'Elena K.',
      role: 'Scale Model Painter',
      content: 'Love the community features. Getting so much inspiration from other painters!',
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-16 bg-white px-4">
      <div className="container-mobile">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Loved by Painters Everywhere
          </h2>
          <p className="text-gray-600">
            See what our community has to say
          </p>
        </div>

        <div className="space-y-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card-base card-padding-lg bg-gray-50">
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-4 italic text-sm leading-relaxed">
                "{testimonial.content}"
              </blockquote>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                <div className="text-xs text-gray-600">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;