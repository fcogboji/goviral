// components/Platforms.tsx
"use client"

import React from 'react';

interface PlatformsProps {
  onPlatformClick: (platformName: string) => void;
}

export default function Platforms({ onPlatformClick }: PlatformsProps) {
  const platforms = [
    { name: 'Instagram', color: 'bg-pink-500' },
    { name: 'Twitter', color: 'bg-blue-400' },
    { name: 'Facebook', color: 'bg-blue-600' },
    { name: 'LinkedIn', color: 'bg-blue-700' },
    { name: 'TikTok', color: 'bg-black' },
    { name: 'YouTube', color: 'bg-red-600' }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Connect All Your Platforms
          </h2>
          <p className="text-xl text-gray-600">
            Manage your entire social media presence from one dashboard
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {platforms.map((platform, index) => (
            <div 
              key={index}
              onClick={() => onPlatformClick(platform.name)}
              className={`${platform.color} text-white p-6 rounded-xl text-center font-semibold cursor-pointer hover:opacity-90 transition-opacity`}
            >
              {platform.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}