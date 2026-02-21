"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const reference = searchParams.get('reference')
    
    if (!reference) {
      setStatus('failed')
      setMessage('Invalid payment reference')
      return
    }

    // Verify payment
    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference }),
        })

        const data = await response.json()

        if (data.success) {
          setStatus('success')
          setMessage('Payment successful! Your subscription is now active.')
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        } else {
          setStatus('failed')
          setMessage(data.message || 'Payment verification failed')
        }
      } catch {
        console.error('Payment verification failed')
        setStatus('failed')
        setMessage('Payment verification failed')
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="text-sm text-gray-500">
              Redirecting to dashboard in 3 seconds...
            </div>
          </>
        )}
        
        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/pricing')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}