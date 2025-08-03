// components/Blog.tsx
"use client"

import React from 'react';

interface BlogProps {
  onBlogClick: (slug: string) => void;
}

export default function Blog({ onBlogClick }: BlogProps) {
  const blogPosts = [
    {
      slug: 'social-media-trends-2024',
      title: '10 Social Media Trends You Can\'t Ignore in 2025',
      excerpt: 'Stay ahead of the curve with these emerging social media trends.',
      date: '2025-07-15'
    },
    {
      slug: 'content-calendar-guide',
      title: 'How to Create a Content Calendar That Actually Works',
      excerpt: 'Step-by-step guide to planning your social media content.',
      date: '2025-07-10'
    },
    {
      slug: 'instagram-algorithm-2024',
      title: 'Cracking the Instagram Algorithm: What Changed in 2025',
      excerpt: 'Latest insights on how to beat the Instagram algorithm.',
      date: '2025-07-05'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest from Our Blog
          </h2>
          <p className="text-xl text-gray-600">
            Tips, strategies, and insights to grow your social media presence
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div 
              key={post.slug}
              onClick={() => onBlogClick(post.slug)}
              className="bg-gray-50 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-600"></div>
              <div className="p-6">
                <p className="text-gray-500 text-sm mb-2">{post.date}</p>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h3>
                <p className="text-gray-600">{post.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}