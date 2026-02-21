"use client"

import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Zap, CreditCard } from 'lucide-react';
import { PLAN_FEATURES } from '@/lib/plan-features';
import {
  getCountryFromTimezone,
  getCurrencyForCountry,
  formatPrice,
  type CurrencyConfig,
} from '@/lib/payment-provider';

type PlanKey = keyof typeof PLAN_FEATURES;

function getPlanPrice(planKey: PlanKey, currency: CurrencyConfig, yearly: boolean): number {
  const plan = PLAN_FEATURES[planKey];
  if (yearly) {
    if (currency.priceSuffix === 'NGN') return plan.yearlyMonthlyPriceNGN;
    if (currency.priceSuffix === 'GBP') return plan.yearlyMonthlyPriceGBP;
    return plan.yearlyMonthlyPrice;
  }
  if (currency.priceSuffix === 'NGN') return plan.priceNGN;
  if (currency.priceSuffix === 'GBP') return plan.priceGBP;
  return plan.priceUSD;
}

interface PricingProps {
  onPlanSelection: (planName: string) => void;
}

export default function Pricing({ onPlanSelection }: PricingProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [currency, setCurrency] = useState<CurrencyConfig>({
    code: 'USD', symbol: '$', locale: 'en-US', priceSuffix: 'USD',
  });

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const country = getCountryFromTimezone(tz);
      setCurrency(getCurrencyForCountry(country));
    } catch {
      // default stays USD
    }
  }, []);

  const plans: { key: PlanKey; description: string; cta: string; style: 'default' | 'popular'; badge?: string }[] = [
    {
      key: 'STARTER',
      description: 'For creators & small businesses',
      cta: 'Start 7-Day Free Trial',
      style: 'default',
    },
    {
      key: 'PRO',
      description: 'For agencies & power users',
      cta: 'Start 7-Day Free Trial',
      style: 'popular',
      badge: 'Most Popular',
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">
            Pricing
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Try Free for 7 Days.{' '}
            <span className="text-indigo-600">Go Viral.</span>
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Every plan includes a 7-day free trial. Cancel anytime before it ends and you won&apos;t be charged.
          </p>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5">
            <CreditCard className="w-4 h-4" />
            Card details required to start trial
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white rounded-full px-2 py-2 border border-gray-200 shadow-sm mt-8">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !isYearly ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isYearly ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                isYearly ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
              }`}>
                -24%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const isPopular = plan.style === 'popular';
            const monthlyPrice = getPlanPrice(plan.key, currency, false);
            const displayPrice = getPlanPrice(plan.key, currency, isYearly);
            const savings = monthlyPrice * 12 - getPlanPrice(plan.key, currency, true) * 12;
            const planData = PLAN_FEATURES[plan.key];

            return (
              <div
                key={plan.key}
                className={`relative rounded-2xl p-8 transition-all ${
                  isPopular
                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-[1.02] lg:scale-105 ring-4 ring-indigo-200'
                    : 'bg-white border border-gray-200 shadow-sm hover:shadow-lg'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                      <Zap className="w-3 h-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-1 ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                    {planData.name}
                  </h3>
                  <p className={`text-sm ${isPopular ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                      {formatPrice(displayPrice, currency)}
                    </span>
                    <span className={`text-sm ${isPopular ? 'text-indigo-200' : 'text-gray-500'}`}>
                      /month
                    </span>
                  </div>
                  {isYearly && (
                    <p className={`text-xs mt-1 ${isPopular ? 'text-indigo-200' : 'text-green-600'}`}>
                      Save {formatPrice(savings, currency)}/year
                    </p>
                  )}
                  <p className={`text-xs mt-2 ${isPopular ? 'text-indigo-200' : 'text-gray-400'}`}>
                    7 days free &middot; then {formatPrice(displayPrice, currency)}/mo
                  </p>
                </div>

                <button
                  onClick={() => onPlanSelection(planData.name)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mb-8 ${
                    isPopular
                      ? 'bg-white text-indigo-600 hover:bg-gray-100 shadow-lg'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
                  }`}
                >
                  {plan.cta}
                </button>

                <ul className="space-y-3">
                  {planData.features.map((feature, i) => {
                    const isAI = feature.includes('AI') || feature.includes('Viral') || feature.includes('Trending');
                    return (
                      <li key={i} className="flex items-start gap-3">
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          isPopular ? 'text-indigo-200' : 'text-green-500'
                        }`} />
                        <span className={`text-sm ${
                          isPopular ? 'text-indigo-100' : 'text-gray-600'
                        } ${isAI ? 'font-semibold' : ''}`}>
                          {isAI && <Sparkles className="w-3 h-3 inline mr-1 text-indigo-400" />}
                          {feature}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
