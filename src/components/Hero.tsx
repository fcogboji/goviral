// components/Hero.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Play } from 'lucide-react';

interface HeroProps {
  onStartTrial: () => void;
  onWatchDemo: () => void;
  isLoading: boolean;
}

export default function Hero({ onStartTrial, onWatchDemo, isLoading }: HeroProps) {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['Viral', 'Seen', 'Shared', 'Trending'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-indigo-950 pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">
              AI-Powered Viral Content Engine
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Don&apos;t Just Post.{' '}
            <br className="hidden sm:block" />
            Go{' '}
            <span className="relative inline-block">
              <span
                key={currentWord}
                className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse"
              >
                {words[currentWord]}
              </span>
            </span>
            .
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Paste your draft. Our AI rewrites it into a scroll-stopping,
            share-worthy post — optimized for every platform. Then we post it
            everywhere with one click.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={onStartTrial}
              className="group bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Make My Content Viral'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onWatchDemo}
              className="text-gray-300 px-8 py-4 rounded-xl text-lg font-semibold border border-gray-700 hover:border-gray-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" /> See It In Action
            </button>
          </div>

          {/* Stat badges */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-400">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-400">7-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-400">6 platforms supported</span>
            </div>
          </div>
        </div>

        {/* Before/After Preview Card — inline "hero demo" */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/60 border-b border-gray-700/50">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
              <span className="ml-3 text-xs text-gray-500 font-mono">GoViral AI Rewriter</span>
            </div>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-800">
              {/* Before */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Your Draft</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Hey everyone! Just launched my new online store selling handmade jewelry.
                  Check it out and let me know what you think. Link in bio. Thanks!
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                    Score: 23/100
                  </span>
                  <span className="text-xs text-gray-600">Generic, no hook, weak CTA</span>
                </div>
              </div>
              {/* After */}
              <div className="p-6 bg-indigo-950/30">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">AI Viral Version</span>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">
                  I quit my 9-5 and made my first $1K selling jewelry I made with my own hands 🧵✨
                  <br /><br />
                  Here&apos;s what nobody tells you about starting a handmade business at 25:
                  <br /><br />
                  The first 3 months? Zero sales. But I kept going.
                  <br /><br />
                  Drop a &quot;🔥&quot; if you want to see how I did it 👇
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                    Score: 91/100
                  </span>
                  <span className="text-xs text-gray-500">Hook + story + engagement CTA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
