"use client"

import { useState, useEffect, useCallback } from 'react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Plus,
  Trash2,
  Calendar,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
  Link2,
} from 'lucide-react'
import Link from 'next/link'

interface BulkPost {
  id: string
  content: string
  imageUrl?: string | null
  platforms: string[]
  scheduledFor: string | null
  status: string
}

interface PlatformInfo {
  name: string
  isConnected: boolean
  isActive: boolean
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  facebook: '📘',
  twitter: '𝕏',
  linkedin: '💼',
  tiktok: '🎵',
  youtube: '📺',
  whatsapp: '💬',
}

function getPlatformIcon(name: string): string {
  return PLATFORM_ICONS[name.toLowerCase()] || '📱'
}

function parseCSV(text: string): { content: string; platforms: string[]; scheduledFor: string }[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const contentIdx = headers.findIndex((h) => ['content', 'text', 'caption', 'post'].includes(h))
  const platformsIdx = headers.findIndex((h) => ['platforms', 'platform', 'channels'].includes(h))
  const dateIdx = headers.findIndex((h) => ['date', 'scheduled', 'schedule', 'datetime'].includes(h))

  const posts: { content: string; platforms: string[]; scheduledFor: string }[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim())
    const content = contentIdx >= 0 ? values[contentIdx] || '' : values[0] || ''
    const platformsRaw = platformsIdx >= 0 ? values[platformsIdx] || '' : ''
    const platforms = platformsRaw
      ? platformsRaw.split(/[;|]/).map((p) => p.trim().toLowerCase()).filter(Boolean)
      : []
    const dateStr = dateIdx >= 0 ? values[dateIdx] : ''
    let scheduledFor = ''
    if (dateStr) {
      const d = new Date(dateStr)
      if (!isNaN(d.getTime())) {
        scheduledFor = d.toISOString().slice(0, 16)
      }
    }
    if (!scheduledFor) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      scheduledFor = tomorrow.toISOString().slice(0, 16)
    }
    if (content) {
      posts.push({ content, platforms, scheduledFor })
    }
  }
  return posts
}

export default function BulkScheduler() {
  const [posts, setPosts] = useState<BulkPost[]>([])
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [savingPost, setSavingPost] = useState<string | null>(null)

  const connectedPlatforms = platforms.filter((p) => p.isConnected && p.isActive)
  const connectedNames = connectedPlatforms.map((p) => p.name.toLowerCase())

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [postsRes, platformsRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/platforms/integrate'),
      ])

      if (!postsRes.ok) {
        const errData = await postsRes.json()
        if (postsRes.status === 403 && errData.redirectTo) {
          window.location.href = errData.redirectTo || '/trial-signup'
          return
        }
        throw new Error(errData.error || 'Failed to load posts')
      }

      if (!platformsRes.ok) {
        throw new Error('Failed to load platforms')
      }

      const postsData = await postsRes.json()
      const platData = await platformsRes.json()

      setPosts(
        (postsData || []).map((p: { id: string; content: string; imageUrl?: string; platforms: string[]; scheduledFor: string | null; status: string }) => ({
          id: p.id,
          content: p.content || '',
          imageUrl: p.imageUrl,
          platforms: p.platforms || [],
          scheduledFor: p.scheduledFor,
          status: p.status?.toLowerCase() || 'draft',
        }))
      )

      const platList = (platData.platforms || []).map((p: { name: string; isConnected: boolean; isActive: boolean }) => ({
        name: p.name,
        isConnected: p.isConnected,
        isActive: p.isActive ?? true,
      }))
      setPlatforms(platList)
    } catch (err) {
      console.error('BulkScheduler fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const addPost = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setPosts((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        content: '',
        platforms: [],
        scheduledFor: tomorrow.toISOString().slice(0, 16),
        status: 'draft',
      },
    ])
  }

  const saveNewPost = async (post: BulkPost) => {
    if (!post.content.trim()) {
      toast.warning('Please add content')
      return
    }
    const validPlatforms = post.platforms.filter((p) => connectedNames.includes(p.toLowerCase()))
    if (validPlatforms.length === 0) {
      toast.warning('Select at least one connected platform')
      return
    }

    setSavingPost(post.id)
    try {
      const scheduledFor = post.scheduledFor ? new Date(post.scheduledFor).toISOString() : null
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: post.content.trim(),
          platforms: validPlatforms,
          scheduledFor,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        if (res.status === 403 && data.redirectTo) {
          window.location.href = data.redirectTo
          return
        }
        throw new Error(data.error || 'Failed to create post')
      }

      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...data, scheduledFor: data.scheduledFor ? data.scheduledFor.slice(0, 16) : null } : p))
      )
      toast.success('Post created')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSavingPost(null)
    }
  }

  const updatePost = async (id: string, updates: Partial<BulkPost>) => {
    const post = posts.find((p) => p.id === id)
    if (!post) return

    if (id.startsWith('new-')) {
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
      return
    }

    setSavingPost(id)
    try {
      const payload: Record<string, unknown> = {}
      if (updates.content !== undefined) payload.content = updates.content
      if (updates.platforms !== undefined) payload.platforms = updates.platforms
      if (updates.scheduledFor !== undefined) {
        payload.scheduledFor = updates.scheduledFor ? new Date(updates.scheduledFor).toISOString() : null
      }

      const res = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 403 && data.redirectTo) {
          window.location.href = data.redirectTo
          return
        }
        throw new Error(data.error || 'Failed to update')
      }

      const data = await res.json()
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                ...data,
                scheduledFor: data.scheduledFor ? data.scheduledFor.slice(0, 16) : null,
              }
            : p
        )
      )
      toast.success('Post updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setSavingPost(null)
    }
  }

  const deletePost = async (id: string) => {
    if (id.startsWith('new-')) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
      setSelectedPosts((prev) => prev.filter((pid) => pid !== id))
      return
    }

    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setPosts((prev) => prev.filter((p) => p.id !== id))
      setSelectedPosts((prev) => prev.filter((pid) => pid !== id))
      toast.success('Post deleted')
    } catch {
      toast.error('Failed to delete post')
    }
  }

  const togglePostSelection = (id: string) => {
    setSelectedPosts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    )
  }

  const handleBulkSchedule = async () => {
    if (selectedPosts.length === 0) return

    const toSchedule = selectedPosts.filter((pid) => !pid.startsWith('new-'))
    const unsaved = selectedPosts.filter((pid) => pid.startsWith('new-'))

    if (unsaved.length > 0) {
      toast.warning(`Save ${unsaved.length} new post(s) first`)
      return
    }

    setScheduling(true)
    let success = 0
    let failed = 0

    for (const postId of toSchedule) {
      const post = posts.find((p) => p.id === postId)
      if (!post?.scheduledFor) continue
      try {
        const res = await fetch(`/api/posts/${postId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduledFor: new Date(post.scheduledFor).toISOString(),
            status: 'SCHEDULED',
          }),
        })
        if (res.ok) success++
        else failed++
      } catch {
        failed++
      }
    }

    setScheduling(false)
    setSelectedPosts([])
    if (success > 0) toast.success(`${success} post(s) scheduled`)
    if (failed > 0) toast.error(`${failed} post(s) failed to schedule`)
    fetchData()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const text = await file.text()
      const parsed = parseCSV(text)
      if (parsed.length === 0) {
        toast.error('No valid posts found in CSV. Use columns: content, platforms, date')
        setUploading(false)
        return
      }

      let created = 0
      for (const row of parsed) {
        const platforms = row.platforms.filter((p) => connectedNames.includes(p))
        if (platforms.length === 0) continue
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: row.content,
            platforms,
            scheduledFor: new Date(row.scheduledFor).toISOString(),
          }),
        })
        if (res.ok) created++
      }
      toast.success(`${created} post(s) imported from CSV`)
      fetchData()
    } catch {
      toast.error('Failed to parse CSV')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Multi Posting</h1>
          <p className="text-gray-600">Schedule and manage posts across all your social platforms</p>
        </div>

        {connectedPlatforms.length === 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800">Connect your platforms first</p>
              <p className="text-sm text-amber-700">
                You need at least one connected platform to create and schedule posts.
              </p>
              <Link
                href="/dashboard/platforms"
                className="inline-flex items-center gap-2 mt-2 text-amber-800 font-medium hover:underline"
              >
                <Link2 className="w-4 h-4" />
                Go to Platforms
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <label className="group bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer">
            <div className="p-8 flex flex-col items-center text-center space-y-4">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 group-hover:text-indigo-500" />
              <h3 className="text-lg font-semibold text-gray-900">Bulk Text Upload</h3>
              <p className="text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'Upload CSV with columns: content, platforms, date'}
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
          </label>

          <Link
            href="/dashboard/create/text"
            className="group bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer"
          >
            <div className="p-8 flex flex-col items-center text-center space-y-4">
              <span className="text-3xl">✍️</span>
              <h3 className="text-lg font-semibold text-gray-900">Create Text Post</h3>
              <p className="text-sm text-gray-600">Write and schedule a single text post</p>
            </div>
          </Link>

          <Link
            href="/dashboard/create/image"
            className="group bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50/30 transition-all cursor-pointer"
          >
            <div className="p-8 flex flex-col items-center text-center space-y-4">
              <span className="text-3xl">🖼️</span>
              <h3 className="text-lg font-semibold text-gray-900">Create Image Post</h3>
              <p className="text-sm text-gray-600">Upload images and schedule</p>
            </div>
          </Link>

          <Link
            href="/dashboard/create/video"
            className="group bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50/30 transition-all cursor-pointer"
          >
            <div className="p-8 flex flex-col items-center text-center space-y-4">
              <span className="text-3xl">🎥</span>
              <h3 className="text-lg font-semibold text-gray-900">Create Video Post</h3>
              <p className="text-sm text-gray-600">Upload video and schedule</p>
            </div>
          </Link>
        </div>

        {selectedPosts.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-900">
                {selectedPosts.length} post(s) selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBulkSchedule}
                  disabled={scheduling}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {scheduling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                  Schedule Selected
                </button>
                <button
                  onClick={() => setSelectedPosts([])}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-xl font-semibold text-gray-900">Your Posts</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={addPost}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Post
              </button>
              <span className="text-sm text-gray-500">{posts.length} posts</span>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50/50">
                <div className="flex gap-4">
                  <input
                    type="checkbox"
                    checked={selectedPosts.includes(post.id)}
                    onChange={() => togglePostSelection(post.id)}
                    className="mt-2 h-4 w-4 text-indigo-600 rounded border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : post.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {post.status}
                      </span>
                      {post.scheduledFor && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.scheduledFor)}
                        </span>
                      )}
                      <button
                        onClick={() => deletePost(post.id)}
                        className="ml-auto text-red-600 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      value={post.content}
                      onChange={(e) =>
                        setPosts((prev) =>
                          prev.map((p) => (p.id === post.id ? { ...p, content: e.target.value } : p))
                        )
                      }
                      onBlur={() => {
                        if (post.id.startsWith('new-') && post.content.trim()) {
                          saveNewPost(post)
                        } else if (!post.id.startsWith('new-') && post.content.trim()) {
                          updatePost(post.id, { content: post.content })
                        }
                      }}
                      placeholder="What do you want to share?"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows={3}
                    />

                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                        <div className="flex flex-wrap gap-2">
                          {connectedPlatforms.map((platform) => (
                            <label key={platform.name} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={post.platforms.map((p) => p.toLowerCase()).includes(platform.name.toLowerCase())}
                                onChange={(e) => {
                                  const current = post.platforms.map((p) => p.toLowerCase())
                                  const name = platform.name.toLowerCase()
                                  const next = e.target.checked
                                    ? [...new Set([...current, name])]
                                    : current.filter((p) => p !== name)
                                  if (post.id.startsWith('new-')) {
                                    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, platforms: next } : p)))
                                  } else {
                                    updatePost(post.id, { platforms: next })
                                  }
                                }}
                                className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                              />
                              <span className="text-sm">
                                {getPlatformIcon(platform.name)} {platform.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                        <input
                          type="datetime-local"
                          value={post.scheduledFor || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            if (post.id.startsWith('new-')) {
                              setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, scheduledFor: val } : p)))
                            } else {
                              updatePost(post.id, { scheduledFor: val })
                            }
                          }}
                          min={new Date().toISOString().slice(0, 16)}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      {post.id.startsWith('new-') && post.content.trim() && (
                        <button
                          onClick={() => saveNewPost(post)}
                          disabled={savingPost === post.id}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          {savingPost === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Save Post
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">
                Create a new post, upload a CSV, or use Create Text/Image to get started
              </p>
              <button
                onClick={addPost}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Post
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
