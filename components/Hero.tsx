// components/Hero.tsx
"use client"

import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

interface HeroProps {
  onStartTrial: () => void;
  onWatchDemo: () => void;
  isLoading: boolean;
}

export default function Hero({ onStartTrial, onWatchDemo, isLoading }: HeroProps) {
  return (
    <section className="bg-gradient-to-br from-indigo-50 to-purple-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Schedule & Track Your
            <span className="text-indigo-600 block">Social Media Posts</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Grow your audience across all platforms with AI-powered scheduling, 
            analytics, and content optimization. Join thousands of creators going viral.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onStartTrial}
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Start Free Trial'} <ArrowRight size={20} />
            </button>
            <button 
              onClick={onWatchDemo}
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              <Play size={20} /> Watch Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}