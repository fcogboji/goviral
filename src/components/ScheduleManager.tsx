"use client"
import { useState, useEffect } from 'react'
import { Calendar, Clock, Plus, Edit, Trash2, Play, Grid, List } from 'lucide-react'
import Image from 'next/image'

interface Post {
  id: string
  content: string
  imageUrl?: string
  scheduledFor?: string
  platforms: string[]
  status: 'scheduled' | 'published' | 'draft'
}

interface Platform {
  displayName: string
  isActive: boolean
}

interface Limits {
  maxPosts: number
  maxPlatforms: number
}

interface Usage {
  posts: { used: number; limit: number }
  platforms: { used: number; limit: number }
}

export default function ScheduleManager() {
  const [viewMode, setViewMode] = useState('grid')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [limits, setLimits] = useState<Limits>({ maxPosts: 10, maxPlatforms: 3 })
  const [usage, setUsage] = useState<Usage>({ posts: { used: 0, limit: 10 }, platforms: { used: 0, limit: 3 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [form, setForm] = useState({ content: '', imageUrl: '', scheduledFor: '', platforms: [] as string[] })
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Fetch posts, platforms, and limits
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        // Fetch posts
        const postsRes = await fetch('/api/posts')
        const postsData = await postsRes.json()
        setPosts(postsData)

        // Fetch platforms
        const platRes = await fetch('/api/platforms/integrate')
        const platData = await platRes.json()
        setConnectedPlatforms(platData.platforms.filter((p: Platform) => p.isActive).map((p: Platform) => p.displayName))

        // Fetch subscription limits
        const subRes = await fetch('/api/subscriptions/status')
        if (subRes.ok) {
          const subData = await subRes.json()
          setLimits(subData.limits || { maxPosts: 10, maxPlatforms: 3 })
          setUsage(subData.usage || { posts: { used: 0, limit: 10 }, platforms: { used: 0, limit: 3 } })
        }
      } catch {
        setError('Failed to load schedule data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter posts by selected platform
  const filteredPosts = posts.filter(post => 
    selectedPlatform === 'all' || post.platforms.includes(selectedPlatform)
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Toast helpers
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  // CRUD Handlers
  const handleCreate = () => {
    setEditingPost(null)
    setForm({ content: '', imageUrl: '', scheduledFor: '', platforms: [] })
    setModalOpen(true)
  }
  
  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setForm({
      content: post.content || '',
      imageUrl: post.imageUrl || '',
      scheduledFor: post.scheduledFor ? post.scheduledFor.slice(0, 16) : '',
      platforms: post.platforms || []
    })
    setModalOpen(true)
  }
  
  const handleDelete = async (post: Post) => {
    if (!window.confirm('Delete this post?')) return
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== post.id))
        showToast('success', 'Post deleted')
      } else {
        showToast('error', 'Failed to delete post')
      }
    } catch {
      showToast('error', 'Failed to delete post')
    }
  }
  
  const handlePublish = async (post: Post) => {
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' })
      })
      if (res.ok) {
        const updated = await res.json()
        setPosts(posts.map(p => p.id === post.id ? updated : p))
        showToast('success', 'Post published')
      } else {
        showToast('error', 'Failed to publish post')
      }
    } catch {
      showToast('error', 'Failed to publish post')
    }
  }

  // Modal submit handler
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.content || form.platforms.length === 0) {
      showToast('error', 'Content and at least one platform are required')
      return
    }
    try {
      const method = editingPost ? 'PUT' : 'POST'
      const url = editingPost ? `/api/posts/${editingPost.id}` : '/api/posts'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: form.content,
          imageUrl: form.imageUrl,
          scheduledFor: form.scheduledFor ? new Date(form.scheduledFor).toISOString() : null,
          platforms: form.platforms
        })
      })
      if (res.ok) {
        const newPost = await res.json()
        if (editingPost) {
          setPosts(posts.map(p => p.id === newPost.id ? newPost : p))
          showToast('success', 'Post updated')
        } else {
          setPosts([newPost, ...posts])
          showToast('success', 'Post scheduled')
        }
        setModalOpen(false)
      } else {
        showToast('error', 'Failed to save post')
      }
    } catch {
      showToast('error', 'Failed to save post')
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>
  }
  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>
  }

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.message}</div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Schedule</h1>
          <p className="text-gray-600">Manage your scheduled posts across all platforms</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          onClick={handleCreate}
          disabled={usage?.posts?.used >= limits.maxPosts}
          title="Schedule a new post"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Post</span>
        </button>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Platform:</span>
            </div>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filter by platform"
            >
              <option value="all">All</option>
              {connectedPlatforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Posts Grid/List */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
      }`}>
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {post.imageUrl && (
              <div className="h-48 bg-gray-100 relative">
                <Image
                  src={post.imageUrl}
                  alt="Post preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              {/* Platform Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {post.platforms.join(', ')}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  post.status === 'scheduled' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : post.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {post.status}
                </span>
              </div>
              {/* Content */}
              <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                {post.content}
              </p>
              {/* Schedule Info */}
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <Clock className="w-4 h-4" />
                <span>{post.scheduledFor ? formatDate(post.scheduledFor) : 'Not scheduled'}</span>
              </div>
              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-700 transition-colors" onClick={() => handleEdit(post)} title="Edit post">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-700 transition-colors" onClick={() => handleDelete(post)} title="Delete post">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {post.status === 'scheduled' && (
                  <button className="text-green-600 hover:text-green-700 transition-colors flex items-center space-x-1" onClick={() => handlePublish(post)} title="Publish now">
                    <Play className="w-4 h-4" />
                    <span className="text-sm">Post Now</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled posts</h3>
          <p className="text-gray-500 mb-6">
            {selectedPlatform === 'all' 
              ? "You haven't scheduled any posts yet." 
              : `No posts scheduled for ${selectedPlatform}.`}
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors mx-auto" onClick={handleCreate} disabled={usage?.posts?.used >= limits.maxPosts} title="Schedule your first post">
            <Plus className="w-4 h-4" />
            <span>Schedule Your First Post</span>
          </button>
        </div>
      )}
      {/* Modal for create/edit post */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative" onSubmit={handleModalSubmit}>
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setModalOpen(false)} title="Close">
              ×
            </button>
            <h2 className="text-lg font-bold mb-4">{editingPost ? 'Edit Post' : 'Schedule Post'}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                required
                title="Post content"
                placeholder="Write your post content here..."
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="text"
                value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Schedule For</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="datetime-local"
                value={form.scheduledFor}
                onChange={e => setForm(f => ({ ...f, scheduledFor: e.target.value }))}
                title="Schedule date and time"
                placeholder="Select date and time"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Platforms</label>
              <select
                className="w-full border rounded px-3 py-2"
                multiple
                value={form.platforms}
                onChange={e => setForm(f => ({ ...f, platforms: Array.from(e.target.selectedOptions, o => o.value) }))}
                required
                title="Select platforms"
              >
                {connectedPlatforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full">
              {editingPost ? 'Update Post' : 'Schedule Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}