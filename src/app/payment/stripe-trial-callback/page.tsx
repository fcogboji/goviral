'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function StripeTrialCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');
  const [details, setDetails] = useState<{
    planName?: string;
    trialDays?: number;
    nextBillingDate?: string;
  }>({});

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const plan = searchParams.get('plan');
      const userId = searchParams.get('user');

      if (!sessionId) {
        setStatus('error');
        setMessage('No payment session found');
        return;
      }

      try {
        const response = await fetch('/api/payment/stripe-trial-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, planName: plan, userId }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Your 7-day free trial has been activated!');
          setDetails({
            planName: data.subscription?.planType || plan || undefined,
            trialDays: 7,
            nextBillingDate: data.subscription?.nextBillingDate,
          });

          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Payment verification failed');
        }
      } catch (err) {
        console.error('Error verifying Stripe payment:', err);
        setStatus('error');
        setMessage('An error occurred while verifying your payment');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-indigo-600 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Trial Activated!</h1>
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="bg-indigo-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-2">
                {details.planName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-semibold text-gray-900">{details.planName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Trial Period:</span>
                  <span className="font-semibold text-gray-900">{details.trialDays} days</span>
                </div>
                {details.nextBillingDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Billing:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(details.nextBillingDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Your card will be automatically charged after the 7-day
                trial period unless you cancel before then.
              </p>
            </div>

            <div className="text-sm text-gray-500 mb-4">Redirecting to dashboard in a few seconds...</div>

            <Link
              href="/dashboard"
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-block text-center"
            >
              Go to Dashboard Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                Your card was not charged. Please try again or contact support if the problem
                persists.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/trial-signup"
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-block text-center"
              >
                Try Again
              </Link>
              <Link
                href="/support"
                className="w-full bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-block text-center"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
