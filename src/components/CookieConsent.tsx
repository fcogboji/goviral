'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'

const STORAGE_KEY = 'goviral_cookie_consent'

type ConsentState = {
  accepted: boolean
  date: string // YYYY-MM-DD when accepted
  lastShown: string // YYYY-MM-DD when banner was last shown
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function getStored(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ConsentState
  } catch {
    return null
  }
}

function setStored(state: ConsentState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

function shouldShowBanner(): boolean {
  const stored = getStored()
  const today = getToday()

  // Never stored = first visit
  if (!stored) return true

  // User already accepted = don't show again
  if (stored.accepted) return false

  // Not accepted: show once per day (if last shown was a different day)
  return stored.lastShown !== today
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (shouldShowBanner()) {
      setVisible(true)
      setStored({
        accepted: false,
        date: '',
        lastShown: getToday(),
      })
    }
  }, [mounted])

  const handleAccept = () => {
    setStored({
      accepted: true,
      date: getToday(),
      lastShown: getToday(),
    })
    setVisible(false)
  }

  const handleReject = () => {
    setStored({
      accepted: false,
      date: '',
      lastShown: getToday(),
    })
    setVisible(false)
  }

  const handleClose = () => {
    // Close without accepting - will show again tomorrow
    setStored({
      accepted: false,
      date: '',
      lastShown: getToday(),
    })
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 animate-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-4 sm:p-6 pr-12 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 flex gap-4">
            <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-xl bg-indigo-100 items-center justify-center">
              <Cookie className="w-6 h-6 text-indigo-600" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <h2 id="cookie-consent-title" className="text-base font-semibold text-gray-900 mb-1">
                We use cookies
              </h2>
              <p id="cookie-consent-desc" className="text-sm text-gray-600">
                We use cookies and similar technologies to provide our service, remember your preferences, and improve your experience. You can manage your choices below or read our{' '}
                <Link href="/cookies" className="text-indigo-600 hover:text-indigo-700 font-medium underline">
                  Cookie Policy
                </Link>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handleReject}
              className="order-2 sm:order-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Reject non-essential
            </button>
            <button
              onClick={handleAccept}
              className="order-1 sm:order-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
