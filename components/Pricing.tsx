// components/Pricing.tsx
"use client"

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface PricingProps {
  onPlanSelection: (planName: string) => void;
}

export default function Pricing({ onPlanSelection }: PricingProps) {
  const plans = [
    {
      name: 'Starter',
      price: '₦5,500',
      description: 'Perfect for individuals getting started',
      features: [
        '5 social accounts',
        '50 posts per month',
        'Basic analytics',
        'Email support'
      ]
    },
    {
      name: 'Creator',
      price: '₦9,000',
      description: 'For content creators and small businesses',
      features: [
        '15 social accounts',
        '200 posts per month',
        'Advanced analytics',
        'AI content suggestions',
        'Priority support'
      ],
      popular: true
    },
    {
      name: 'Agency',
      price: '₦25,000',
      description: 'For agencies and large teams',
      features: [
        'Unlimited accounts',
        'Unlimited posts',
        'White-label reports',
        'Team collaboration',
        'Dedicated support'
      ]
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600">
            Start free, scale as you grow
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-xl shadow-lg p-8 border-2 ${
                plan.popular ? 'border-indigo-600' : 'border-gray-200'
              } relative`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {plan.price}<span className="text-lg text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => onPlanSelection(plan.name)}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}