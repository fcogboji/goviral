// components/CrossPosting.tsx — "How It Works" 3-step section
"use client"

import React from 'react';
import { PenLine, Sparkles, Send, ArrowDown } from 'lucide-react';

export default function CrossPosting() {
  const steps = [
    {
      number: '01',
      icon: <PenLine className="w-6 h-6" />,
      title: 'Write Your Draft',
      description: 'Type any rough idea, caption, or thought. It doesn\'t have to be perfect — that\'s what the AI is for.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      number: '02',
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI Makes It Viral',
      description: 'Our AI rewrites your draft with scroll-stopping hooks, emotional triggers, and platform-specific formatting. Viral score jumps from 20 → 90+.',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      highlight: true,
    },
    {
      number: '03',
      icon: <Send className="w-6 h-6" />,
      title: 'Post Everywhere',
      description: 'One click publishes to Instagram, Twitter/X, TikTok, LinkedIn, Facebook, and YouTube — each version optimized for that platform.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span className="inline-block text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">
            How It Works
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            From Boring Draft to Viral Post
            <br className="hidden sm:block" />
            <span className="text-indigo-600"> in 30 Seconds</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Other tools just schedule your posts. GoViral actually makes them go viral.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connection line on desktop */}
          <div className="hidden md:block absolute top-20 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-blue-200 via-indigo-300 to-purple-200" />

          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Arrow between steps on mobile */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center py-4">
                  <ArrowDown className="w-5 h-5 text-gray-300" />
                </div>
              )}
              <div
                className={`relative rounded-2xl border ${step.borderColor} p-8 ${
                  step.highlight ? 'bg-indigo-50/50 ring-2 ring-indigo-200 shadow-lg shadow-indigo-100' : 'bg-white shadow-md'
                } transition-all hover:shadow-xl hover:-translate-y-1`}
              >
                {/* Step circle */}
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br text-white font-bold text-lg mb-6 shadow-md" 
                  style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}>
                  <div className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} text-white`}>
                    {step.icon}
                  </div>
                </div>
                
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Step {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {step.highlight && (
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                    <Sparkles className="w-3 h-3" />
                    This is what makes GoViral different
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
