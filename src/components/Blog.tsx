// components/Blog.tsx — Blog / Resources section
"use client"

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface BlogProps {
  onBlogClick: (slug: string) => void;
}

export default function Blog({ onBlogClick }: BlogProps) {
  const blogPosts = [
    {
      slug: 'ai-content-going-viral',
      title: 'How AI-Rewritten Content Gets 5x More Engagement',
      excerpt: 'We analyzed 10,000 posts. Here\'s what makes AI-optimized content consistently outperform manual captions.',
      date: 'Feb 2026',
      category: 'AI & Content',
      gradient: 'from-indigo-500 to-purple-600',
    },
    {
      slug: 'hook-formulas-that-work',
      title: '7 Hook Formulas That Stop the Scroll Every Time',
      excerpt: 'The exact opening lines that turn casual scrollers into engaged followers — backed by data.',
      date: 'Jan 2026',
      category: 'Growth Tips',
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      slug: 'multi-platform-strategy',
      title: 'The Multi-Platform Strategy Used by Top Creators',
      excerpt: 'Why posting to one platform is leaving money on the table, and how to be everywhere without burnout.',
      date: 'Jan 2026',
      category: 'Strategy',
      gradient: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">
            Resources
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Learn How to <span className="text-indigo-600">Go Viral</span>
          </h2>
          <p className="text-lg text-gray-600">
            Strategies, case studies, and insights to grow your audience faster.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              onClick={() => onBlogClick(post.slug)}
              className="group cursor-pointer rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Gradient header */}
              <div className={`h-44 bg-gradient-to-br ${post.gradient} flex items-end p-6`}>
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                  {post.category}
                </span>
              </div>

              <div className="p-6">
                <p className="text-xs text-gray-400 font-medium mb-2">{post.date}</p>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
