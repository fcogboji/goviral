"use client"

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Calendar, 
  X,
  Check,
  AlertCircle
} from 'lucide-react'

interface CampaignForm {
  title: string
  description: string
  budget: number
  startDate: string
  endDate: string
  platforms: string[]
  posts: Array<{
    content: string
    imageUrl: string
    scheduledFor: string
    platforms: string[]
  }>
}

interface Platform {
  name: string
  displayName: string
  isConnected: boolean
  isActive: boolean
}

export default function CampaignCreateForm() {
  const [form, setForm] = useState<CampaignForm>({
    title: '',
    description: '',
    budget: 0,
    startDate: '',
    endDate: '',
    platforms: [],
    posts: []
  })
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch available platforms on component mount
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await fetch('/api/platforms/integrate')
        if (response.ok) {
          const data = await response.json()
          setPlatforms(data.platforms || [])
        }
      } catch (error) {
        console.error('Failed to fetch platforms:', error)
        // Set some default platforms if API fails
        setPlatforms([
          { name: 'facebook', displayName: 'Facebook', isConnected: true, isActive: true },
          { name: 'twitter', displayName: 'Twitter', isConnected: true, isActive: true },
          { name: 'instagram', displayName: 'Instagram', isConnected: true, isActive: true },
          { name: 'linkedin', displayName: 'LinkedIn', isConnected: true, isActive: true },
          { name: 'tiktok', displayName: 'TikTok', isConnected: false, isActive: true }
        ])
      }
    }

    fetchPlatforms()
  }, [])

  const addPost = () => {
    setForm(prev => ({
      ...prev,
      posts: [...prev.posts, {
        content: '',
        imageUrl: '',
        scheduledFor: '',
        platforms: []
      }]
    }))
  }

  const removePost = (index: number) => {
    setForm(prev => ({
      ...prev,
      posts: prev.posts.filter((_, i) => i !== index)
    }))
  }

  const updatePost = (index: number, field: string, value: string | number | string[]) => {
    setForm(prev => ({
      ...prev,
      posts: prev.posts.map((post, i) => 
        i === index ? { ...post, [field]: value } : post
      )
    }))
  }

  const validateForm = () => {
    if (!form.title.trim()) {
      setError('Campaign title is required')
      return false
    }
    if (!form.startDate || !form.endDate) {
      setError('Start and end dates are required')
      return false
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError('End date must be after start date')
      return false
    }
    if (form.platforms.length === 0) {
      setError('Select at least one platform')
      return false
    }
    if (form.posts.length === 0) {
      setError('Add at least one post to the campaign')
      return false
    }
    
    for (let i = 0; i < form.posts.length; i++) {
      const post = form.posts[i]
      if (!post.content.trim()) {
        setError(`Post ${i + 1} content is required`)
        return false
      }
      if (post.platforms.length === 0) {
        setError(`Select platforms for post ${i + 1}`)
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        setSuccess('Campaign created successfully!')
        setForm({
          title: '',
          description: '',
          budget: 0,
          startDate: '',
          endDate: '',
          platforms: [],
          posts: []
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create campaign')
      }
    } catch {
      setError('Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  const connectedPlatforms = platforms.filter(p => p.isConnected && p.isActive)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
          <p className="text-gray-600 mt-2">Plan and schedule multiple posts across platforms</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {/* Campaign Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter campaign title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget (₦)
              </label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm(prev => ({ ...prev, budget: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your campaign goals and strategy..."
            />
          </div>

          {/* Campaign Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                title="Select campaign start date"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                title="Select campaign end date"
              />
            </div>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Platforms *
            </label>
            {connectedPlatforms.length === 0 ? (
              <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No connected platforms available</p>
                <p className="text-sm text-gray-400">Please connect your social media accounts first</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {connectedPlatforms.map((platform) => (
                  <label key={platform.name} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.platforms.includes(platform.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm(prev => ({
                            ...prev,
                            platforms: [...prev.platforms, platform.name]
                          }))
                        } else {
                          setForm(prev => ({
                            ...prev,
                            platforms: prev.platforms.filter(p => p !== platform.name)
                          }))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{platform.displayName}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Posts Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Campaign Posts</h3>
              <button
                type="button"
                onClick={addPost}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Post</span>
              </button>
            </div>

            {form.posts.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No posts added yet</p>
                <p className="text-sm text-gray-400">Click &quot;Add Post&quot; to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {form.posts.map((post, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Post {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removePost(index)}
                        className="text-red-600 hover:text-red-700"
                        title="Remove post"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content *
                        </label>
                        <textarea
                          value={post.content}
                          onChange={(e) => updatePost(index, 'content', e.target.value)}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Write your post content..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image URL
                        </label>
                        <input
                          type="url"
                          value={post.imageUrl}
                          onChange={(e) => updatePost(index, 'imageUrl', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Schedule For
                        </label>
                        <input
                          type="datetime-local"
                          value={post.scheduledFor}
                          onChange={(e) => updatePost(index, 'scheduledFor', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          title="Select post schedule date and time"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Platforms *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {connectedPlatforms.map((platform) => (
                            <label key={platform.name} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={post.platforms.includes(platform.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    updatePost(index, 'platforms', [...post.platforms, platform.name])
                                  } else {
                                    updatePost(index, 'platforms', post.platforms.filter(p => p !== platform.name))
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">{platform.displayName}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Create Campaign</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}