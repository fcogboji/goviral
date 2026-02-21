'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface PostMetadata {
  [key: string]: unknown;
}

interface Campaign {
  id: string;
  name: string;
}

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
}

interface Analytics {
  id: string;
  date: string;
  impressions: number;
  engagement: number;
  clicks: number;
}

interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  scheduledFor?: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  metadata?: PostMetadata;
  userId: string;
  campaignId?: string;
  campaign?: Campaign;
  socialAccounts?: SocialAccount[];
  analytics?: Analytics[];
}

export default function PostsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    platform: '',
    campaignId: ''
  });

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.campaignId) params.append('campaignId', filters.campaignId);

      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/sign-in');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, router]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/sign-in');
      return;
    }
    fetchPosts();
  }, [user, isLoaded, router, fetchPosts]);

  const handleCreatePost = async (postData: Partial<Post>) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      const newPost = await response.json();
      setPosts([newPost, ...posts]);
      return newPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      throw err;
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete post');
      }
      
      setPosts(posts.filter(post => post.id !== postId));
    } catch {
      setError('Failed to delete post');
    }
  };

  const handlePostAction = async (postId: string, action: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} post`);
      }

      const updatedPost = await response.json();
      
      if (action === 'duplicate') {
        setPosts([updatedPost, ...posts]);
      } else {
        setPosts(posts.map(post => post.id === postId ? updatedPost : post));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error}</p>
        <button 
          onClick={fetchPosts}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
        <CreatePostModal onCreatePost={handleCreatePost} />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-medium">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <select
              value={filters.platform}
              onChange={(e) => setFilters({...filters, platform: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Platforms</option>
              <option value="twitter">Twitter</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign ID
            </label>
            <input
              type="text"
              placeholder="Enter campaign ID"
              value={filters.campaignId}
              onChange={(e) => setFilters({...filters, campaignId: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white shadow rounded-lg">
        {posts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No posts found</p>
            <CreatePostModal onCreatePost={handleCreatePost} />
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                      {post.campaign && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {post.campaign.name}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-900 mb-2 line-clamp-3">{post.content}</p>
                    
                    {post.imageUrl && (
                      <div className="mb-3">
                        <Image 
                          src={post.imageUrl} 
                          alt="Post image" 
                          width={128}
                          height={128}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Platforms: {post.platforms.join(', ')}</span>
                      <span>Created: {formatDate(post.createdAt)}</span>
                      {post.scheduledFor && (
                        <span>Scheduled: {formatDate(post.scheduledFor)}</span>
                      )}
                    </div>

                    {post.analytics && post.analytics.length > 0 && (
                      <div className="mt-2 flex space-x-4 text-sm text-gray-600">
                        <span>Impressions: {post.analytics.reduce((sum, a) => sum + a.impressions, 0)}</span>
                        <span>Engagement: {post.analytics.reduce((sum, a) => sum + a.engagement, 0)}</span>
                        <span>Clicks: {post.analytics.reduce((sum, a) => sum + a.clicks, 0)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => router.push(`/dashboard/posts/${post.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View
                    </button>
                    
                    {post.status === 'draft' && (
                      <button
                        onClick={() => handlePostAction(post.id, 'publish')}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Publish
                      </button>
                    )}
                    
                    {post.status === 'scheduled' && (
                      <button
                        onClick={() => handlePostAction(post.id, 'pause')}
                        className="text-yellow-600 hover:text-yellow-800 text-sm"
                      >
                        Pause
                      </button>
                    )}
                    
                    <button
                      onClick={() => handlePostAction(post.id, 'duplicate')}
                      className="text-purple-600 hover:text-purple-800 text-sm"
                    >
                      Duplicate
                    </button>
                    
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Create Post Modal Component
function CreatePostModal({ onCreatePost }: { onCreatePost: (postData: Partial<Post>) => Promise<Post> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    imageUrl: '',
    scheduledFor: '',
    platforms: [] as string[],
    campaignId: '',
    metadata: {} as PostMetadata
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim() || formData.platforms.length === 0) {
      toast.warning('Content and at least one platform are required');
      return;
    }

    try {
      setSubmitting(true);
      const postData = {
        ...formData,
        scheduledFor: formData.scheduledFor || undefined,
        imageUrl: formData.imageUrl || undefined,
        campaignId: formData.campaignId || undefined,
      };
      
      await onCreatePost(postData);
      setIsOpen(false);
      setFormData({
        content: '',
        imageUrl: '',
        scheduledFor: '',
        platforms: [],
        campaignId: '',
        metadata: {}
      });
    } catch {
      // Error is handled by parent component
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlatformChange = (platform: string) => {
    if (formData.platforms.includes(platform)) {
      setFormData({
        ...formData,
        platforms: formData.platforms.filter(p => p !== platform)
      });
    } else {
      setFormData({
        ...formData,
        platforms: [...formData.platforms, platform]
      });
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Create Post
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Post</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Write your post content..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled For
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={(e) => setFormData({...formData, scheduledFor: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platforms *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok'].map((platform) => (
                <label key={platform} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.platforms.includes(platform)}
                    onChange={() => handlePlatformChange(platform)}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign ID
            </label>
            <input
              type="text"
              value={formData.campaignId}
              onChange={(e) => setFormData({...formData, campaignId: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter campaign ID"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Post'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}