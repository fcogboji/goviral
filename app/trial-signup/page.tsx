// app/trial-signup/page.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, Star } from 'lucide-react';

export default function TrialSignupPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Creator');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Get plan from URL params
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam) {
      setSelectedPlan(planParam.charAt(0).toUpperCase() + planParam.slice(1));
    }
  }, [searchParams]);

  const plans = [
    {
      name: 'Starter',
      price: '$9',
      originalPrice: '$19',
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
      price: '$29',
      originalPrice: '$59',
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
      price: '$99',
      originalPrice: '$199',
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

  const handleStartTrial = async () => {
    if (!isSignedIn) {
      // Redirect to sign in
      router.push('/sign-in?redirect=/trial-signup');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: selectedPlan,
          planType: 'trial'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Failed to start trial');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      setError('An error occurred while starting your trial');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Trial Started Successfully!
          </h1>
          <p className="text-gray-600 mb-6">
            Your 30-day free trial is now active. You&apos;ll be redirected to your dashboard shortly.
          </p>
          <div className="animate-pulse">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Start Your Free Trial
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            30 days free, then 50% off for your first 3 months
          </p>
          <p className="text-sm text-gray-500">
            No credit card required • Cancel anytime
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!isSignedIn && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700">
              You need to sign in to start your free trial.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-lg p-6 border-2 cursor-pointer transition-all ${
                selectedPlan === plan.name
                  ? 'border-indigo-600 ring-2 ring-indigo-200'
                  : 'border-gray-200 hover:border-indigo-300'
              } ${plan.popular ? 'ring-2 ring-indigo-100' : ''}`}
              onClick={() => setSelectedPlan(plan.name)}
            >
              {plan.popular && (
                <div className="text-center mb-4">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-indigo-600">{plan.price}</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
                <div className="text-sm text-gray-500 line-through mb-1">
                  Regular price: {plan.originalPrice}/month
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-current" />
                  ))}
                </div>
                <p className="text-xs text-gray-500">Loved by 10,000+ users</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleStartTrial}
            disabled={isLoading}
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Starting Trial...
              </>
            ) : (
              <>
                {isSignedIn ? 'Start Free Trial' : 'Sign In to Start Trial'}
              </>
            )}
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            By starting your trial, you agree to our{' '}
            <a href="/terms" className="text-indigo-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-indigo-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What happens during your trial?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Full Access</h4>
              <p className="text-sm text-gray-600">
                Get complete access to all features for 30 days
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">No Commitment</h4>
              <p className="text-sm text-gray-600">
                Cancel anytime during your trial period
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Special Pricing</h4>
              <p className="text-sm text-gray-600">
                Get 50% off for your first 3 months after trial
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}