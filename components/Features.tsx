// components/Features.tsx
"use client"

import React from 'react';
import { Calendar, BarChart3, Zap, Users } from 'lucide-react';

interface FeaturesProps {
  onFeatureClick: (featureName: string) => void;
}

export default function Features({ onFeatureClick }: FeaturesProps) {
  const features = [
    {
      icon: <Calendar size={32} />,
      title: 'Smart Scheduling',
      description: 'Schedule posts across multiple platforms with AI-optimized timing for maximum engagement.',
      name: 'smart_scheduling'
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Analytics Dashboard',
      description: 'Track performance, engagement, and growth with detailed analytics and insights.',
      name: 'analytics_dashboard'
    },
    {
      icon: <Zap size={32} />,
      title: 'Instant Publishing',
      description: 'Publish content instantly across all your social media platforms with one click.',
      name: 'instant_publishing'
    },
    {
      icon: <Users size={32} />,
      title: 'Team Collaboration',
      description: 'Work with your team, assign roles, and manage content creation together.',
      name: 'team_collaboration'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Go Viral
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful tools designed to help content creators, businesses, and marketers 
            maximize their social media presence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              onClick={() => onFeatureClick(feature.name)}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-100"
            >
              <div className="text-indigo-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}