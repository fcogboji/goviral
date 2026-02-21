// components/FinalCTA.tsx — Final conversion CTA
"use client"

import React from 'react';
import { ArrowRight, Sparkles, Shield } from 'lucide-react';

interface FinalCTAProps {
  onStartTrial: () => void;
  onJoinCreators: () => void;
}

export default function FinalCTA({ onStartTrial, onJoinCreators }: FinalCTAProps) {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
          <Sparkles className="w-4 h-4 text-indigo-200" />
          <span className="text-sm font-medium text-indigo-100">
            7-day free trial · Cancel anytime
          </span>
        </div>

        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Stop Posting Into
          <br />
          the Void.
        </h2>
        <p className="text-lg sm:text-xl text-indigo-200 mb-10 max-w-2xl mx-auto leading-relaxed">
          Every day you post without GoViral&apos;s AI is a day your content underperforms.
          Start your free trial and see the difference in your first post.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <button
            onClick={onStartTrial}
            className="group bg-white text-indigo-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all shadow-2xl flex items-center justify-center gap-2"
          >
            Make My Content Viral
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onJoinCreators}
            className="text-white px-8 py-4 rounded-xl text-lg font-semibold border-2 border-white/30 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            Join the Community
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-indigo-200">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Works with 6+ platforms</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Setup in under 2 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
}
