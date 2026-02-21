// components/Testimonials.tsx — Creator success stories
"use client"

import React from 'react';
import { Star, Quote } from 'lucide-react';

interface TestimonialsProps {
  onTestimonialClick: (testimonialId: string) => void;
}

export default function Testimonials({ onTestimonialClick }: TestimonialsProps) {
  const testimonials = [
    {
      id: 'testimonial_1',
      name: 'Oluwatobi A.',
      role: 'Content Creator',
      location: 'Lagos, Nigeria',
      content: 'I went from never getting 10K views to 2.6 million views in 6 weeks. The AI rewriter is insane — it turned my boring product posts into stories people actually share.',
      metric: '2.6M views',
      rating: 5,
    },
    {
      id: 'testimonial_2',
      name: 'Chioma N.',
      role: 'Small Business Owner',
      location: 'Abuja, Nigeria',
      content: 'I used to spend 3 hours writing captions for 5 platforms. Now I write one draft, hit "Make it Viral," and GoViral handles everything. I got 10x more engagement in the first week.',
      metric: '10x engagement',
      rating: 5,
    },
    {
      id: 'testimonial_3',
      name: 'David O.',
      role: 'Digital Marketing Agency',
      location: 'Accra, Ghana',
      content: 'We manage 12 client accounts. GoViral cut our posting time by 80% and our clients are seeing way better engagement. The viral scoring helps us prioritize what to post.',
      metric: '80% time saved',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3">
            Success Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Creators Are Going Viral
            <br />
            <span className="text-indigo-400">With GoViral</span>
          </h2>
          <p className="text-lg text-gray-400">
            Real results from real creators. No fake screenshots.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              onClick={() => onTestimonialClick(testimonial.id)}
              className="group relative bg-gray-900 border border-gray-800 rounded-2xl p-8 cursor-pointer hover:border-indigo-500/50 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/5"
            >
              {/* Metric badge */}
              <div className="absolute -top-3 right-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
                  {testimonial.metric}
                </span>
              </div>

              {/* Quote icon */}
              <Quote className="w-8 h-8 text-indigo-500/20 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 leading-relaxed mb-6">
                &quot;{testimonial.content}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">
                    {testimonial.role} · {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
