// app/payment/success/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [paymentDetails, setPaymentDetails] = useState({
    sessionId: '',
    planName: '',
    amount: ''
  })

  useEffect(() => {
    // Get payment details from URL params
    const sessionId = searchParams.get('session_id')
    const planName = searchParams.get('plan')
    const amount = searchParams.get('amount')

    if (sessionId) {
      setPaymentDetails({
        sessionId: sessionId,
        planName: planName || 'Premium Plan',
        amount: amount || '$29'
      })
    }

    setIsLoading(false)

    // Optional: Redirect to dashboard after 10 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 10000)

    return () => clearTimeout(timer)
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="h-8 w-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your payment. Your subscription has been activated successfully.
        </p>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan:</span>
              <span className="font-medium">{paymentDetails.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{paymentDetails.amount}</span>
            </div>
            {paymentDetails.sessionId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs">
                  {paymentDetails.sessionId.slice(-8)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">What&apos;s Next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Access all premium features</li>
            <li>• Create unlimited campaigns</li>
            <li>• Connect multiple social platforms</li>
            <li>• Get priority support</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
          
          <Link
            href="/dashboard/billing"
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            View Billing Details
          </Link>
        </div>

        {/* Auto-redirect notice */}
        <p className="text-xs text-gray-500 mt-4">
          You&apos;ll be automatically redirected to your dashboard in 10 seconds
        </p>
      </div>
    </div>
  )
}