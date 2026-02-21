"use client";

import React, { useEffect, useState } from 'react';
import { XCircle, RefreshCw, ArrowLeft, HelpCircle, CreditCard } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Interface for failure reasons
interface FailureReason {
  title: string;
  description: string;
  solution: string;
}

// Payment failure page component
export default function PaymentFailurePage() {
  // Router for navigation
  const router = useRouter();

  // Search params to get failure details
  const searchParams = useSearchParams();

  // State for failure details
  const [failureDetails, setFailureDetails] = useState<{
    reference?: string;
    reason?: string;
    message?: string;
  }>({});

  // Common failure reasons and solutions
  const failureReasons: FailureReason[] = [
    {
      title: "Insufficient Funds",
      description: "Your account doesn't have enough balance to complete the transaction",
      solution: "Please check your account balance and try again, or use a different payment method"
    },
    {
      title: "Card Declined",
      description: "Your bank declined the transaction",
      solution: "Contact your bank to authorize online transactions or try a different card"
    },
    {
      title: "Network Error",
      description: "There was a temporary network issue during payment processing",
      solution: "Please check your internet connection and try again"
    },
    {
      title: "Invalid Card Details",
      description: "The card information provided was incorrect or incomplete",
      solution: "Double-check your card number, expiry date, and CVV, then try again"
    },
    {
      title: "Transaction Timeout",
      description: "The payment took too long to process and timed out",
      solution: "Try the payment again with a stable internet connection"
    }
  ];

  // Effect to get failure details from URL params
  useEffect(() => {
    // Extract failure details from search params
    const reference = searchParams.get('reference');
    const reason = searchParams.get('reason');
    const message = searchParams.get('message');

    // Set failure details state
    setFailureDetails({
      reference: reference || undefined,
      reason: reason || undefined,
      message: message || undefined
    });
  }, [searchParams]);

  // Function to retry payment
  const retryPayment = () => {
    // Redirect back to pricing page to retry
    router.push('/pricing');
  };

  // Function to contact support
  const contactSupport = () => {
    // Redirect to contact/support page
    router.push('/contact');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Failure hero section */}
      <div className="bg-gradient-to-r from-red-400 to-pink-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Failure icon */}
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>

          {/* Failure message */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Payment Failed
          </h1>

          <p className="text-xl text-white opacity-90 mb-8">
            We&apos;re sorry, but something went wrong. Please try refreshing the page or contact support if the problem persists.
          </p>

          {/* Failure details card */}
          {failureDetails.reference && (
            <div className="bg-white rounded-lg p-8 max-w-md mx-auto text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Transaction Details
              </h3>

              <div className="space-y-3">
                {failureDetails.reference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium text-gray-900 text-sm">
                      {failureDetails.reference}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-red-600">
                    Failed
                  </span>
                </div>

                {failureDetails.reason && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reason:</span>
                    <span className="font-medium text-gray-900 text-sm">
                      {failureDetails.reason}
                    </span>
                  </div>
                )}

                {failureDetails.message && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">
                      {failureDetails.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* What to do next section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Should You Do Next?
            </h2>
            <p className="text-xl text-gray-600">
              Choose from the options below to resolve the payment issue
            </p>
          </div>

          {/* Action buttons grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">

            {/* Retry Payment */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Try Again
              </h3>
              <p className="text-gray-600 mb-4">
                Retry your payment with the same or different payment method
              </p>
              <button
                onClick={retryPayment}
                className="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Retry Payment
              </button>
            </div>

            {/* Contact Support */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get Help
              </h3>
              <p className="text-gray-600 mb-4">
                Contact our support team for assistance with payment issues
              </p>
              <button
                onClick={contactSupport}
                className="inline-block bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Contact Support
              </button>
            </div>

            {/* Go Back */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Go Back
              </h3>
              <p className="text-gray-600 mb-4">
                Return to the previous page or homepage
              </p>
              <Link
                href="/"
                className="inline-block bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>

          {/* Common issues and solutions */}
          <div className="bg-white rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Common Payment Issues & Solutions
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {failureReasons.map((reason, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-1">
                      <CreditCard className="w-4 h-4 text-red-600" />
                    </div>

                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {reason.title}
                      </h4>

                      <p className="text-gray-600 mb-3">
                        {reason.description}
                      </p>

                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-1">
                          Solution:
                        </p>
                        <p className="text-sm text-blue-700">
                          {reason.solution}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support section */}
          <div className="bg-red-50 rounded-lg p-8 text-center mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Still Having Issues?
            </h3>
            <p className="text-gray-600 mb-6">
              Our support team is available 24/7 to help resolve payment problems
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                href="/help"
                className="inline-block bg-white text-red-600 py-3 px-6 rounded-lg font-semibold border border-red-600 hover:bg-red-50 transition-colors"
              >
                View Help Center
              </Link>
              <Link
                href="/contact"
                className="inline-block bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Contact Support
              </Link>
            </div>

            {/* Contact information */}
            <div className="mt-6 pt-6 border-t border-red-200">
              <p className="text-sm text-gray-600">
                Email: support@yourplatform.com | Phone: +234-800-123-4567
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Support available Monday - Friday, 9:00 AM - 6:00 PM (GMT+1)
              </p>
            </div>
          </div>

          {/* Security notice */}
          <div className="bg-gray-100 rounded-lg p-6 mt-8">
            <div className="flex items-center justify-center mb-3">
              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center mr-2">
                <XCircle className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                Security Notice
              </h4>
            </div>
            <p className="text-gray-700 text-center">
              Your payment information is always protected with bank-level encryption.
              No sensitive data is stored on our servers after a failed transaction.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Your Platform. All rights reserved. |
            <Link href="/privacy" className="text-gray-300 hover:text-white ml-1">
              Privacy Policy
            </Link> |
            <Link href="/terms" className="text-gray-300 hover:text-white ml-1">
              Terms of Service
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
