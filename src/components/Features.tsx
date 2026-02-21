// components/Features.tsx — AI-powered features showcase
"use client"

import React from 'react';
import { Sparkles, Target, BarChart3, TrendingUp, Layers, Zap } from 'lucide-react';

interface FeaturesProps {
  onFeatureClick: (featureName: string) => void;
}

export default function Features({ onFeatureClick }: FeaturesProps) {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI Viral Rewriter',
      description: 'Paste any draft and watch AI transform it into a scroll-stopping, share-worthy post with hooks, storytelling, and CTAs.',
      name: 'ai_rewriter',
      badge: 'Core Feature',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Platform-Specific Versions',
      description: 'One post becomes 6 — each version auto-adapted for Twitter\'s brevity, LinkedIn\'s depth, Instagram\'s vibe, and more.',
      name: 'platform_versions',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Viral Score (0-100)',
      description: 'Know before you post. AI scores your content on hook strength, emotional appeal, shareability, and platform fit.',
      name: 'viral_score',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Trending Topics & Hashtags',
      description: 'Real-time trend detection finds what\'s hot right now so you can ride the wave and get discovered.',
      name: 'trending',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'One-Click Multi-Posting',
      description: 'Publish to Instagram, Twitter/X, TikTok, LinkedIn, Facebook, and YouTube simultaneously. No switching apps.',
      name: 'cross_posting',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Smart Analytics',
      description: 'Track what\'s working across all platforms. See engagement, reach, and growth — with AI-powered recommendations to improve.',
      name: 'analytics',
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">
            Features
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Not Another Scheduler.
            <br />
            <span className="text-indigo-600">A Viral Content Engine.</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Buffer and Hootsuite schedule your posts. GoViral makes them go viral — 
            then posts them everywhere. Here&apos;s what&apos;s under the hood.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => onFeatureClick(feature.name)}
              className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-5 shadow-md`}>
                {feature.icon}
              </div>

              {/* Badge */}
              {feature.badge && (
                <span className="absolute top-6 right-6 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                  {feature.badge}
                </span>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
