"use client"

import { useEffect, useState, useCallback, useMemo } from 'react'
import Image from 'next/image'

interface PostMetadata {
  [key: string]: unknown;
}

interface Campaign {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  [key: string]: unknown;
}

interface Analytics {
  id: string;
  date: string;
  impressions: number;
  engagement: number;
  clicks: number;
  [key: string]: unknown;
}

interface Post {
  id: string
  content: string
  imageUrl?: string
  scheduledFor?: string
  platforms: string[]
  campaignId?: string
  metadata?: PostMetadata
  status: string
  publishedAt?: string
  campaign?: Campaign
  socialAccounts?: SocialAccount[]
  analytics?: Analytics[]
}

export default function PostDetailPage() {
  // Simulate getting ID from URL params
  const id = "sample-post-123"
  
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock post data for demonstration
  const mockPost: Post = useMemo(() => ({
    id: "sample-post-123",
    content: "🚀 Excited to share our latest product update! We've been working hard to bring you new features that will revolutionize your workflow. What do you think? #ProductUpdate #Innovation #TechNews",
    imageUrl: "https://via.placeholder.com/400x300",
    scheduledFor: "2024-02-15T14:30:00Z",
    platforms: ["Twitter", "LinkedIn", "Facebook"],
    status: "scheduled",
    campaignId: "campaign-456",
    publishedAt: undefined,
    campaign: {
      id: "campaign-456",
      name: "Q1 Product Launch"
    },
    socialAccounts: [
      { id: "acc-1", platform: "Twitter", username: "@ourcompany" },
      { id: "acc-2", platform: "LinkedIn", username: "Our Company" }
    ],
    analytics: []
  }), [])

  // Fetch post data
  const fetchPost = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, this would be: const response = await fetch(`/api/posts/${id}`)
      // For demo purposes, we'll use mock data
      setPost(mockPost)
    } catch (error) {
      console.error('Error fetching post:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [mockPost])

  useEffect(() => {
    fetchPost()
  }, [fetchPost])

  // Handle post actions
  const handleAction = async (action: string, updates?: PostMetadata) => {
    try {
      console.log(`Performing action: ${action}`, updates)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (action === 'duplicate') {
        // In a real app, this would navigate to the new post
        alert('Post duplicated successfully! (In real app, would navigate to new post)')
      } else if (action === 'publish' && post) {
        // Update post status
        const updatedPost = { ...post, status: 'published', publishedAt: new Date().toISOString() }
        setPost(updatedPost)
        alert('Post published successfully!')
      } else if (action === 'pause' && post) {
        const updatedPost = { ...post, status: 'paused' }
        setPost(updatedPost)
        alert('Post paused successfully!')
      } else if (action === 'resume' && post) {
        const updatedPost = { ...post, status: 'scheduled' }
        setPost(updatedPost)
        alert('Post resumed successfully!')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  // Handle post deletion
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      console.log('Deleting post:', id)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      alert('Post deleted successfully! (In real app, would navigate to posts list)')
    } catch (error) {
      console.error('Error deleting post:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button 
          onClick={fetchPost}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Post not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Post Details</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => handleAction('duplicate')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Duplicate
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Content</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
              {post.imageUrl && (
                <div className="mt-3">
                  <Image 
                    src={post.imageUrl} 
                    alt="Post content" 
                    width={400}
                    height={300}
                    className="w-full max-w-sm rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  post.status === 'published' ? 'bg-green-100 text-green-800' :
                  post.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                  post.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
              </div>
              
              {post.scheduledFor && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Scheduled for:</span>
                  <span className="text-gray-800 text-sm">
                    {new Date(post.scheduledFor).toLocaleString()}
                  </span>
                </div>
              )}
              
              {post.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Published at:</span>
                  <span className="text-gray-800 text-sm">
                    {new Date(post.publishedAt).toLocaleString()}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Platforms:</span>
                <div className="flex flex-wrap gap-1">
                  {post.platforms.map((platform, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              {post.campaign && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Campaign:</span>
                  <span className="text-gray-800 text-sm">{post.campaign.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {post.status === 'scheduled' && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => handleAction('publish')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Publish Now
            </button>
            <button
              onClick={() => handleAction('pause')}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            >
              Pause
            </button>
          </div>
        )}

        {post.status === 'paused' && (
          <div className="mt-6">
            <button
              onClick={() => handleAction('resume')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Resume Schedule
            </button>
          </div>
        )}

        {post.status === 'published' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-green-800 font-medium">✅ Post Successfully Published</h3>
            <p className="text-green-700 text-sm mt-1">
              This post has been published to all selected platforms.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}