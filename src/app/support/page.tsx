'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Loader2, CheckCircle } from 'lucide-react'

export default function Support() {
  const { user } = useUser()
  const [email, setEmail] = useState('')
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress)
    }
  }, [user?.primaryEmailAddress?.emailAddress])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in subject and message')
      return
    }
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || user?.primaryEmailAddress?.emailAddress,
          subject: subject.trim(),
          message: message.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSent(true)
        setSubject('')
        setMessage('')
      } else {
        setError(data.error || 'Failed to send message')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">Support Center</h1>
          <p className="text-white/80 mb-8 text-center">
            We&apos;re here to help! Contact our support team for assistance with your account, billing, or technical issues.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-4">Contact Support</h3>
              {sent ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <CheckCircle className="w-16 h-16 text-green-400" />
                  <p className="text-lg font-medium">Message sent successfully!</p>
                  <p className="text-white/80 text-sm">We&apos;ll get back to you soon.</p>
                  <button
                    onClick={() => setSent(false)}
                    className="text-indigo-300 hover:text-white underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Your email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="What do you need help with?"
                      className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your issue..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                    />
                  </div>
                  {error && <p className="text-red-300 text-sm">{error}</p>}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-white text-purple-900 font-semibold py-3 px-6 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    Send Message
                  </button>
                </form>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-4">Quick Help</h3>
              <div className="space-y-4">
                <Link href="/dashboard" className="block p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-colors">
                  <h4 className="font-semibold mb-2">Getting Started</h4>
                  <p className="text-white/80 text-sm">Learn the basics of using GoViral</p>
                </Link>
                <Link href="/dashboard/campaigns" className="block p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-colors">
                  <h4 className="font-semibold mb-2">Campaign Setup</h4>
                  <p className="text-white/80 text-sm">How to create your first campaign</p>
                </Link>
                <Link href="/dashboard/analytics" className="block p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-colors">
                  <h4 className="font-semibold mb-2">Analytics</h4>
                  <p className="text-white/80 text-sm">Understanding your metrics</p>
                </Link>
                <Link href="/dashboard/settings" className="block p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-colors">
                  <h4 className="font-semibold mb-2">Billing</h4>
                  <p className="text-white/80 text-sm">Payment and subscription questions</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
