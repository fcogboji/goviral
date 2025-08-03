"use client"
import { useState, useEffect } from 'react'

interface BulkPost {
  id: string
  content: string
  imageUrl?: string
  platforms: string[]
  scheduledFor: string
  status: 'draft' | 'scheduled' | 'published'
}

interface Platform {
  name: string
  displayName: string
  isConnected: boolean
  isActive: boolean
  icon: React.ReactElement
}

export default function BulkScheduler() {
  const [posts, setPosts] = useState<BulkPost[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])

  // Mock platform icons
  const getPlatformIcon = (name: string): React.ReactElement => {
    const icons: Record<string, React.ReactElement> = {
      instagram: <div className="w-5 h-5 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded"></div>,
      twitter: <div className="w-5 h-5 bg-blue-500 rounded"></div>,
      facebook: <div className="w-5 h-5 bg-blue-600 rounded"></div>,
      linkedin: <div className="w-5 h-5 bg-blue-700 rounded"></div>,
      tiktok: <div className="w-5 h-5 bg-black rounded"></div>,
      youtube: <div className="w-5 h-5 bg-red-600 rounded"></div>
    }
    return icons[name] || <div className="w-5 h-5 bg-gray-400 rounded"></div>
  }

  useEffect(() => {
    const mockPlatforms: Platform[] = [
      { name: 'instagram', displayName: 'Instagram', isConnected: true, isActive: true, icon: getPlatformIcon('instagram') },
      { name: 'twitter', displayName: 'Twitter', isConnected: true, isActive: true, icon: getPlatformIcon('twitter') },
      { name: 'facebook', displayName: 'Facebook', isConnected: true, isActive: true, icon: getPlatformIcon('facebook') },
      { name: 'linkedin', displayName: 'LinkedIn', isConnected: true, isActive: true, icon: getPlatformIcon('linkedin') },
      { name: 'tiktok', displayName: 'TikTok', isConnected: false, isActive: false, icon: getPlatformIcon('tiktok') },
      { name: 'youtube', displayName: 'YouTube', isConnected: true, isActive: true, icon: getPlatformIcon('youtube') }
    ]

    const mockPosts: BulkPost[] = [
      {
        id: 'post-1',
        content: 'Check out our latest product launch! 🚀 #innovation #tech',
        platforms: ['instagram', 'twitter'],
        scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        status: 'scheduled'
      },
      {
        id: 'post-2',
        content: 'Behind the scenes look at our development process 👨‍💻',
        platforms: ['linkedin', 'facebook'],
        scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        status: 'draft'
      }
    ]

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        setTimeout(() => {
          setPlatforms(mockPlatforms)
          setPosts(mockPosts)
          setLoading(false)
        }, 1000)
        
      } catch (error) {
        console.error('Failed to load data:', error)
        setError('Failed to load data. Using sample data.')
        setPlatforms(mockPlatforms)
        setPosts(mockPosts)
        setLoading(false)
      }
    }

    loadData()
  }, []) // Empty dependency array is correct since we're using local mock data

  const addPost = () => {
    const newPost: BulkPost = {
      id: `post-${Date.now()}`,
      content: '',
      platforms: [],
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      status: 'draft'
    }
    setPosts([...posts, newPost])
  }

  const updatePost = (id: string, updates: Partial<BulkPost>) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, ...updates } : post
    ))
  }

  const deletePost = (id: string) => {
    setPosts(posts.filter(post => post.id !== id))
    setSelectedPosts(selectedPosts.filter(postId => postId !== id))
  }

  const togglePostSelection = (id: string) => {
    setSelectedPosts(prev => 
      prev.includes(id) 
        ? prev.filter(postId => postId !== id)
        : [...prev, id]
    )
  }

  const handleBulkSchedule = async () => {
    if (selectedPosts.length === 0) return

    setScheduling(true)
    
    // Simulate API call
    setTimeout(() => {
      setPosts(posts.map(post => 
        selectedPosts.includes(post.id) 
          ? { ...post, status: 'scheduled' as const }
          : post
      ))
      setSelectedPosts([])
      setScheduling(false)
    }, 1500)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    
    setTimeout(() => {
      const newPosts: BulkPost[] = [
        {
          id: `post-${Date.now()}-1`,
          content: 'Sample post from uploaded file - Amazing product announcement! 📢',
          platforms: ['instagram', 'twitter'],
          scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          status: 'draft'
        },
        {
          id: `post-${Date.now()}-2`,
          content: 'Another great post from your upload - Check out our team! 👥',
          platforms: ['facebook', 'linkedin'],
          scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          status: 'draft'
        }
      ]
      setPosts([...posts, ...newPosts])
      setUploading(false)
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bulk scheduler...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Multi Posting</h1>
          <p className="text-gray-600">Schedule and manage posts across all your social platforms</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-5 h-5 text-yellow-600 mr-2">⚠️</div>
              <span className="text-sm text-yellow-800">{error}</span>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Bulk Text Upload */}
          <div className="group bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer">
            <label className="block p-8 cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 text-gray-400 group-hover:text-blue-500 transition-colors duration-300 text-2xl">📄</div>
                  <div className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors duration-300 ml-2 text-xl">⬆️</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900">
                  Bulk Text Upload
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-700">
                  {uploading ? 'Uploading...' : 'Upload CSV/Excel with your post content and schedule in bulk'}
                </p>
                <div className="flex items-center space-x-2 pt-2">
                  {platforms.filter(p => p.isConnected).slice(0, 4).map(platform => (
                    <div key={platform.name} title={platform.displayName}>
                      {platform.icon}
                    </div>
                  ))}
                  {platforms.filter(p => p.isConnected).length > 4 && (
                    <span className="text-sm text-gray-500">+{platforms.filter(p => p.isConnected).length - 4}</span>
                  )}
                </div>
              </div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {/* Bulk Video Upload */}
          <div className="group bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50/30 transition-all duration-300 cursor-pointer">
            <div className="p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 text-gray-400 group-hover:text-purple-500 transition-colors duration-300 text-2xl">🎥</div>
                  <div className="w-8 h-8 text-gray-400 group-hover:text-purple-500 transition-colors duration-300 ml-2 text-xl">⬆️</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-900">
                  Bulk Video Upload
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">NEW</span>
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-700">
                  Upload and schedule multiple videos at once across platforms
                </p>
                <div className="flex items-center space-x-2 pt-2">
                  {platforms.filter(p => p.isConnected && ['instagram', 'tiktok', 'youtube'].includes(p.name)).map(platform => (
                    <div key={platform.name} title={platform.displayName}>
                      {platform.icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Video Creation */}
          <div className="group bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50/30 transition-all duration-300 cursor-pointer">
            <div className="p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 text-gray-400 group-hover:text-green-500 transition-colors duration-300 text-2xl">🎥</div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-900">
                  AI Video Creation
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">NEW</span>
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-700">
                  Create viral 2x2 grid videos in bulk with AI assistance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Posts Actions */}
        {selectedPosts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedPosts.length} post(s) selected
                </span>
                <button
                  onClick={handleBulkSchedule}
                  disabled={scheduling}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {scheduling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm">📅</span>
                      <span>Schedule Selected</span>
                    </>
                  )}
                </button>
              </div>
              <button
                onClick={() => setSelectedPosts([])}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}

        {/* Posts Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Your Posts</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={addPost}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span className="text-sm">➕</span>
                  <span>New Post</span>
                </button>
                <span className="text-sm text-gray-500">
                  {posts.length} total posts
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedPosts.includes(post.id)}
                    onChange={() => togglePostSelection(post.id)}
                    className="mt-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.status === 'scheduled' 
                            ? 'bg-blue-100 text-blue-800'
                            : post.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <span>🕐</span>
                          <span>{new Date(post.scheduledFor).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete post"
                      >
                        🗑️
                      </button>
                    </div>

                    <textarea
                      value={post.content}
                      onChange={(e) => updatePost(post.id, { content: e.target.value })}
                      placeholder="What do you want to share?"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                          <div className="flex items-center space-x-2">
                            {platforms.filter(p => p.isConnected).map(platform => (
                              <label key={platform.name} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={post.platforms.includes(platform.name)}
                                  onChange={(e) => {
                                    const newPlatforms = e.target.checked
                                      ? [...post.platforms, platform.name]
                                      : post.platforms.filter(p => p !== platform.name)
                                    updatePost(post.id, { platforms: newPlatforms })
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <div className="flex items-center space-x-1">
                                  {platform.icon}
                                  <span className="text-sm text-gray-700">{platform.displayName}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Schedule For</label>
                          <input
                            type="datetime-local"
                            value={post.scheduledFor}
                            onChange={(e) => updatePost(post.id, { scheduledFor: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-6xl text-gray-400 mx-auto mb-4">📅</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Start by creating your first post or uploading content in bulk</p>
              <button
                onClick={addPost}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <span>➕</span>
                <span>Create Your First Post</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}