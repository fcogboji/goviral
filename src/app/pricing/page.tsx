'use client'

import { useState, useEffect } from 'react'
import { Check, Star, CreditCard, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { PLAN_FEATURES } from '@/lib/plan-features'
import {
  getCountryFromTimezone,
  getCurrencyForCountry,
  formatPrice,
  type CurrencyConfig,
} from '@/lib/payment-provider'

type ApiPlan = {
  id: string
  name: string
  price: number
  priceNGN: number | null
  priceGBP: number | null
  yearlyMonthlyPrice: number | null
  yearlyMonthlyPriceNGN: number | null
  yearlyMonthlyPriceGBP: number | null
  description: string | null
  features: string[]
  trialDays: number
}

function getPriceFromPlan(plan: ApiPlan, currency: CurrencyConfig, yearly: boolean): number {
  if (yearly) {
    if (currency.priceSuffix === 'NGN' && plan.yearlyMonthlyPriceNGN != null)
      return plan.yearlyMonthlyPriceNGN
    if (currency.priceSuffix === 'GBP' && plan.yearlyMonthlyPriceGBP != null)
      return plan.yearlyMonthlyPriceGBP
    if (plan.yearlyMonthlyPrice != null) return plan.yearlyMonthlyPrice
  }
  if (currency.priceSuffix === 'NGN' && plan.priceNGN != null) return plan.priceNGN
  if (currency.priceSuffix === 'GBP' && plan.priceGBP != null) return plan.priceGBP
  return plan.price
}

export default function PricingPage() {
  const { user } = useUser()
  const [isYearly, setIsYearly] = useState(false)
  const [currency, setCurrency] = useState<CurrencyConfig>({
    code: 'USD', symbol: '$', locale: 'en-US', priceSuffix: 'USD',
  })
  const [apiPlans, setApiPlans] = useState<ApiPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const country = getCountryFromTimezone(tz)
      setCurrency(getCurrencyForCountry(country))
    } catch {
      // default stays USD
    }
  }, [])

  useEffect(() => {
    fetch('/api/plans')
      .then((res) => res.ok ? res.json() : { plans: [] })
      .then((data) => {
        setApiPlans(data.plans || [])
      })
      .catch(() => setApiPlans([]))
      .finally(() => setPlansLoading(false))
  }, [])

  // Use API plans if available, else fallback to plan-features
  const plans = apiPlans.length > 0
    ? apiPlans.map((p, i) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        features: p.features,
        popular: i === apiPlans.length - 1, // Last plan = most popular
        color: i === apiPlans.length - 1 ? 'border-indigo-500' : 'border-gray-200',
        trialDays: p.trialDays,
        getPrice: (c: CurrencyConfig, y: boolean) => getPriceFromPlan(p, c, y),
      }))
    : [
        {
          id: 'starter',
          name: PLAN_FEATURES.STARTER.name,
          description: 'For creators & small businesses',
          features: PLAN_FEATURES.STARTER.features,
          popular: false,
          color: 'border-gray-200',
          trialDays: 7,
          getPrice: (c: CurrencyConfig, y: boolean) =>
            y
              ? (c.priceSuffix === 'NGN' ? PLAN_FEATURES.STARTER.yearlyMonthlyPriceNGN : c.priceSuffix === 'GBP' ? PLAN_FEATURES.STARTER.yearlyMonthlyPriceGBP : PLAN_FEATURES.STARTER.yearlyMonthlyPrice)
              : (c.priceSuffix === 'NGN' ? PLAN_FEATURES.STARTER.priceNGN : c.priceSuffix === 'GBP' ? PLAN_FEATURES.STARTER.priceGBP : PLAN_FEATURES.STARTER.priceUSD),
        },
        {
          id: 'pro',
          name: PLAN_FEATURES.PRO.name,
          description: 'For agencies & power users',
          features: PLAN_FEATURES.PRO.features,
          popular: true,
          color: 'border-indigo-500',
          trialDays: 7,
          getPrice: (c: CurrencyConfig, y: boolean) =>
            y
              ? (c.priceSuffix === 'NGN' ? PLAN_FEATURES.PRO.yearlyMonthlyPriceNGN : c.priceSuffix === 'GBP' ? PLAN_FEATURES.PRO.yearlyMonthlyPriceGBP : PLAN_FEATURES.PRO.yearlyMonthlyPrice)
              : (c.priceSuffix === 'NGN' ? PLAN_FEATURES.PRO.priceNGN : c.priceSuffix === 'GBP' ? PLAN_FEATURES.PRO.priceGBP : PLAN_FEATURES.PRO.priceUSD),
        },
      ]

  const platforms = ['Instagram', 'Twitter/X', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span className="text-2xl font-bold text-indigo-600">GoViral</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                Sign In
              </Link>
              <Link href="/trial-signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-2 max-w-3xl mx-auto">
            Every plan includes a free trial. Cancel anytime.
          </p>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5 mb-8">
            <CreditCard className="w-4 h-4" />
            Card details required to start trial
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-lg font-medium transition-colors ${!isYearly ? 'text-indigo-600' : 'text-gray-600'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              style={{ backgroundColor: isYearly ? '#4F46E5' : '#D1D5DB' }}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                  isYearly ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg font-medium transition-colors ${isYearly ? 'text-indigo-600' : 'text-gray-600'}`}>
              Yearly <span className="text-green-600 font-semibold">Save up to 24%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {plansLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => {
              const monthlyPrice = plan.getPrice(currency, false)
              const displayPrice = plan.getPrice(currency, isYearly)
              const yearlyTotal = plan.getPrice(currency, true) * 12
              const savings = monthlyPrice * 12 - yearlyTotal

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl shadow-lg border-2 ${plan.color} relative ${
                    plan.popular ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-6">{plan.description}</p>
                      <div className="mb-2">
                        <span className="text-4xl font-bold text-gray-900">{formatPrice(displayPrice, currency)}</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      {isYearly && (
                        <div className="mb-4">
                          <span className="text-sm text-gray-500">
                            {formatPrice(yearlyTotal, currency)} billed annually
                          </span>
                          <div className="text-xs text-green-600 font-medium mt-1">
                            Save {formatPrice(savings, currency)}/year
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mb-6">
                        {plan.trialDays} days free &middot; then {formatPrice(displayPrice, currency)}/mo
                      </p>
                      <Link
                        href={user ? `/dashboard/settings` : `/trial-signup?plan=${plan.name.toLowerCase()}`}
                        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors inline-block text-center ${
                          plan.popular
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {user ? 'Manage Subscription' : `Start ${plan.trialDays}-Day Free Trial`}
                      </Link>
                    </div>

                    <div className="space-y-4">
                      {plan.features.map((feature, featureIndex) => {
                        const isAI = feature.includes('AI') || feature.includes('Viral') || feature.includes('Trending');
                        return (
                          <div key={featureIndex} className="flex items-center">
                            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                            <span className={`text-gray-700 ${isAI ? 'font-semibold' : ''}`}>
                              {isAI && <Sparkles className="w-3 h-3 inline mr-1 text-indigo-500" />}
                              {feature}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Platforms Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All Plans Include</h2>
            <p className="text-xl text-gray-600">Connect and post to all major social media platforms</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {platforms.map((platform) => (
              <div key={platform} className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">
                    {platform === 'Instagram' && '📸'}
                    {platform === 'Twitter/X' && '𝕏'}
                    {platform === 'Facebook' && '📘'}
                    {platform === 'LinkedIn' && '💼'}
                    {platform === 'TikTok' && '🎵'}
                    {platform === 'YouTube' && '📺'}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900">{platform}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Do I need a card to start the trial?</h3>
              <p className="text-gray-600">
                Yes, we require card details to start your free trial. This helps us verify your identity and ensures a seamless transition if you continue after the trial. You won&apos;t be charged during the trial period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Can I cancel during the trial?</h3>
              <p className="text-gray-600">
                Absolutely. Cancel anytime during your trial and you won&apos;t be charged a single cent. No questions asked.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">What happens after the trial?</h3>
              <p className="text-gray-600">
                After your trial ends, you&apos;ll be automatically charged the monthly rate for your selected plan. You can cancel or switch plans at any time.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. Upgrades take effect immediately, downgrades at the next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee. If you&apos;re not satisfied, contact us for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Go Viral?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Start your free trial. No risk, cancel anytime.
          </p>
          <Link
            href="/trial-signup"
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Start Your Free Trial
            <Star className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  )
}
