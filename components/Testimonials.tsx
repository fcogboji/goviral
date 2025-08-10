// components/Testimonials.tsx
"use client"

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

interface Review {
  id: string
  name: string
  role?: string | null
  content: string
  rating: number
}

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // form state
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/reviews', { cache: 'no-store' })
      const data = await res.json()
      setReviews(data.reviews || [])
    } catch {
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, content, rating }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }
      // Prepend new review
      setReviews((prev) => [data.review, ...prev])
      setName('')
      setRole('')
      setContent('')
      setRating(5)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">What Our Users Say</h2>
          <p className="text-gray-600">Add your review below. New reviews appear instantly.</p>
        </div>

        {/* Review form */}
        <form onSubmit={submitReview} className="mb-10 bg-white rounded-xl shadow p-6 grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm text-gray-700">Name (optional if signed in)</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="rounded border px-3 py-2" placeholder="Your name" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-gray-700">Role</label>
            <input value={role} onChange={(e) => setRole(e.target.value)} className="rounded border px-3 py-2" placeholder="e.g., Creator" />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm text-gray-700">Review</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="rounded border px-3 py-2" placeholder="Share your experience..." rows={3} />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">Rating</label>
            <input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-20 rounded border px-3 py-2" />
          </div>
          <div className="md:justify-self-end">
            <button disabled={submitting} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
          {error && <div className="md:col-span-2 text-sm text-red-600">{error}</div>}
        </form>

        {/* Reviews grid */}
        {loading ? (
          <div className="text-center text-gray-600">Loading reviews...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex mb-4">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={20} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">&quot;{r.content}&quot;</p>
                <div>
                  <p className="font-semibold text-gray-900">{r.name}</p>
                  {r.role && <p className="text-gray-600">{r.role}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}