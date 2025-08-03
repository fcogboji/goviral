// components/Testimonials.tsx
"use client"

import React from 'react';
import { Star } from 'lucide-react';

interface TestimonialsProps {
  onTestimonialClick: (testimonialId: string) => void;
}

export default function Testimonials({ onTestimonialClick }: TestimonialsProps) {
  const testimonials = [
    {
      id: 'testimonial_1',
      name: 'Sarah Johnson',
      role: 'Content Creator',
      content: 'GoViral helped me grow my Instagram from 1K to 50K followers in just 3 months!',
      rating: 5
    },
    {
      id: 'testimonial_2',
      name: 'Mike Chen',
      role: 'Small Business Owner',
      content: 'The scheduling feature saves me 10 hours per week. Best investment for my business.',
      rating: 5
    },
    {
      id: 'testimonial_3',
      name: 'Emma Davis',
      role: 'Marketing Manager',
      content: 'GoViral has been a game-changer for our social media strategy',
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of satisfied creators and businesses
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              onClick={() => onTestimonialClick(testimonial.id)}
              className="bg-white p-8 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">&quot;{testimonial.content}&quot;</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}