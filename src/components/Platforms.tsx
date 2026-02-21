// components/Platforms.tsx — Supported platforms with comparison
"use client"

import React from 'react';
import { Check, X } from 'lucide-react';

interface PlatformsProps {
  onPlatformClick: (platformName: string) => void;
}

export default function Platforms({ onPlatformClick }: PlatformsProps) {
  const platforms = [
    { name: 'Instagram', emoji: '📸', desc: 'Reels, Stories, Feed' },
    { name: 'Twitter/X', emoji: '𝕏', desc: 'Tweets & Threads' },
    { name: 'TikTok', emoji: '🎵', desc: 'Short-form Video' },
    { name: 'LinkedIn', emoji: '💼', desc: 'Professional Posts' },
    { name: 'Facebook', emoji: '📘', desc: 'Pages & Groups' },
    { name: 'YouTube', emoji: '📺', desc: 'Videos & Shorts' },
  ];

  const comparison = [
    { feature: 'Multi-platform posting', goviral: true, others: true },
    { feature: 'Post scheduling', goviral: true, others: true },
    { feature: 'Basic analytics', goviral: true, others: true },
    { feature: 'AI viral content rewriter', goviral: true, others: false },
    { feature: 'Viral score (0-100)', goviral: true, others: false },
    { feature: 'Platform-specific AI captions', goviral: true, others: false },
    { feature: 'Trending topics & hashtags', goviral: true, others: false },
    { feature: 'Engagement predictions', goviral: true, others: false },
    { feature: 'Built for creators who want to go viral', goviral: true, others: false },
  ];

  return (
    <section id="platforms" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Platforms grid */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">
            Platforms
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            One Post. <span className="text-indigo-600">Every Platform.</span>
          </h2>
          <p className="text-lg text-gray-600">
            Write once, and GoViral creates optimized versions for each platform — then publishes them all simultaneously.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-20 lg:mb-28">
          {platforms.map((platform, index) => (
            <button
              key={index}
              onClick={() => onPlatformClick(platform.name)}
              className="group flex flex-col items-center gap-3 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="text-4xl">{platform.emoji}</span>
              <div className="text-center">
                <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {platform.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{platform.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Comparison table */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              GoViral vs Generic Schedulers
            </h3>
            <p className="text-gray-600">
              See why GoViral isn&apos;t just another Buffer or Hootsuite clone.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Table header */}
            <div className="grid grid-cols-3 bg-gray-50 text-sm font-semibold text-gray-500 uppercase tracking-wider">
              <div className="px-6 py-4">Feature</div>
              <div className="px-6 py-4 text-center">
                <span className="text-indigo-600">GoViral</span>
              </div>
              <div className="px-6 py-4 text-center">Others</div>
            </div>

            {/* Table rows */}
            {comparison.map((row, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 text-sm ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                } ${!row.others ? 'bg-indigo-50/30' : ''} border-t border-gray-100`}
              >
                <div className="px-6 py-4 text-gray-700 font-medium">{row.feature}</div>
                <div className="px-6 py-4 flex justify-center">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div className="px-6 py-4 flex justify-center">
                  {row.others ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
