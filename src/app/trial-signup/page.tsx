"use client"

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, Star } from 'lucide-react';
import { PLAN_FEATURES } from '@/lib/plan-features';
import {
  getCountryFromTimezone,
  getCurrencyForCountry,
  formatPrice,
  type CurrencyConfig,
} from '@/lib/payment-provider';
type PlanKey = keyof typeof PLAN_FEATURES;

function getPlanPrice(planKey: PlanKey, currency: CurrencyConfig): number {
  const plan = PLAN_FEATURES[planKey];
  if (currency.priceSuffix === 'NGN') return plan.priceNGN;
  if (currency.priceSuffix === 'GBP') return plan.priceGBP;
  return plan.priceUSD;
}

export default function TrialSignupPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Pro');
  const [error, setError] = useState('');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyConfig>({
    code: 'USD', symbol: '$', locale: 'en-US', priceSuffix: 'USD',
  });

  const isExpired = searchParams.get('expired') === 'true';
  const wasCanceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam) {
      setSelectedPlan(planParam.charAt(0).toUpperCase() + planParam.slice(1));
    }
  }, [searchParams]);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const country = getCountryFromTimezone(tz);
      setDetectedCountry(country);
      setCurrency(getCurrencyForCountry(country));
    } catch {
      // default stays USD
    }
  }, []);

  const plans: { key: PlanKey; description: string; popular: boolean }[] = [
    {
      key: 'STARTER',
      description: 'Perfect for individuals and content creators',
      popular: false,
    },
    {
      key: 'PRO',
      description: 'For professionals and growing businesses',
      popular: true,
    },
  ];

  const handleStartTrial = async () => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect=/trial-signup');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/trial/start-with-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: selectedPlan,
          countryCode: detectedCountry,
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl;
        } else {
          setError('Failed to initialize payment');
        }
      } else {
        setError(data.error || 'Failed to start trial');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error starting trial:', err);
      setError('An error occurred while starting your trial');
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Start Your Free Trial
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            7 days free trial
          </p>
          <p className="text-sm text-gray-500">
            Credit card required &bull; Cancel anytime
          </p>
        </div>

        {isExpired && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 font-medium">
              Your free trial has expired. Choose a plan below to continue using GoViral.
            </p>
          </div>
        )}

        {wasCanceled && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              Payment was cancelled. You can try again when you&apos;re ready.
            </p>
          </div>
        )}

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const planData = PLAN_FEATURES[plan.key];
            const price = getPlanPrice(plan.key, currency);

            return (
              <div
                key={plan.key}
                className={`bg-white rounded-lg shadow-lg p-6 border-2 cursor-pointer transition-all ${
                  selectedPlan === planData.name
                    ? 'border-indigo-600 ring-2 ring-indigo-200'
                    : 'border-gray-200 hover:border-indigo-300'
                } ${plan.popular ? 'ring-2 ring-indigo-100' : ''}`}
                onClick={() => setSelectedPlan(planData.name)}
              >
                {plan.popular && (
                  <div className="text-center mb-4">
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{planData.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-indigo-600">{formatPrice(price, currency)}</span>
                    <span className="text-sm text-gray-500">/month</span>
                  </div>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {planData.features.map((feature, featureIndex) => (
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
            );
          })}
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
                Get complete access to all features for 7 days
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
              <h4 className="font-semibold text-gray-900 mb-2">Automatic Billing</h4>
              <p className="text-sm text-gray-600">
                After trial, you&apos;ll be charged the monthly rate unless you cancel
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
