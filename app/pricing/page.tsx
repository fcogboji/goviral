import { auth } from '@clerk/nextjs/server'
import { Check, Star } from 'lucide-react'
import Link from 'next/link'

export default async function PricingPage() {
  const { userId } = await auth()

  const plans = [
    {
      name: 'Starter',
      price: 9,
      description: 'Perfect for individuals getting started',
      features: [
        '5 social accounts',
        '50 posts per month',
        'Basic analytics',
        'Email support',
        'Content scheduling',
        'Cross-platform posting'
      ],
      popular: false,
      color: 'border-gray-200'
    },
    {
      name: 'Creator',
      price: 18,
      description: 'Best for growing creators',
      features: [
        '15 social accounts',
        'Unlimited posts',
        'Advanced analytics',
        'Priority support',
        'Content studio access',
        'Bulk scheduling',
        'Team collaboration',
        'Custom templates'
      ],
      popular: true,
      color: 'border-blue-500'
    },
    {
      name: 'Pro',
      price: 27,
      description: 'Best for scaling brands',
      features: [
        'Unlimited social accounts',
        'Unlimited posts',
        'Premium analytics',
        '24/7 support',
        'Content studio access',
        'Bulk scheduling',
        'Team collaboration',
        'Custom templates',
        'Viral growth consulting',
        'API access'
      ],
      popular: false,
      color: 'border-gray-200'
    }
  ]

  const platforms = [
    'Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              GoViral
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                Sign In
              </Link>
              <Link href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
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
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include a 7-day free trial.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className="text-gray-600">Monthly</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" id="billing-toggle" title="Toggle billing period" />
              <label htmlFor="billing-toggle" className="block w-12 h-6 bg-gray-200 rounded-full cursor-pointer">
                <div className="block w-6 h-6 bg-white rounded-full shadow transform transition-transform"></div>
              </label>
            </div>
            <span className="text-gray-600">Yearly <span className="text-green-600 font-medium">Save 40%</span></span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg border-2 ${plan.color} relative ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <Link
                    href={userId ? `/dashboard/settings` : `/signup?plan=${plan.name.toLowerCase()}`}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors inline-block text-center ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {userId ? 'Manage Subscription' : 'Start Free Trial'}
                  </Link>
                </div>

                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platforms Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              All Plans Include
            </h2>
            <p className="text-xl text-gray-600">
              Connect and post to all major social media platforms
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {platforms.map((platform, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">
                    {platform === 'Instagram' && '📸'}
                    {platform === 'Twitter' && '🐦'}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until the end of your current billing period.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                What&apos;s included in the free trial?
              </h3>
              <p className="text-gray-600">
                The 7-day free trial includes all features of the Creator plan, so you can test everything before committing.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee. If you&apos;re not satisfied, contact us for a full refund.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. Upgrades take effect immediately, downgrades at the next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Go Viral?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of creators who are already growing their audience with GoViral.
          </p>
          <Link
            href="/signup"
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