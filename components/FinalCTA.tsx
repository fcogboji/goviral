// components/FinalCTA.tsx
"use client"

import React from 'react';

interface FinalCTAProps {
  onStartTrial: () => void;
  onJoinCreators: () => void;
}

export default function FinalCTA({ onStartTrial, onJoinCreators }: FinalCTAProps) {
  return (
    <section className="py-20 bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Go Viral?
        </h2>
        <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
          Join thousands of creators who are already growing their audience with GoViral.
          Start your free trial today - no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onStartTrial}
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Free Trial
          </button>
          <button 
            onClick={onJoinCreators}
            className="bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-800 transition-colors border-2 border-indigo-400"
          >
            Join Community
          </button>
        </div>
      </div>
    </section>
  );
}