"use client"

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  BarChart3,
  Users,
  TrendingUp,
  Plus,
  Settings,
  Bell,
  Filter,
  Heart,
  MoreHorizontal,
  RefreshCw,
  Zap,
  Eye,
  Share2,
  type LucideIcon
} from 'lucide-react'

// Type definitions
interface Post {
  id: string;
  content: string;
  status: string;
  platforms: string[];
  createdAt: string;
  publishedAt: string | null;
  analytics: {
    engagements: number;
    reach: number;
    impressions: number;
  } | null;
}

interface DashboardStats {
  stats: {
    totalPosts: number;
    publishedPosts: number;
    scheduledPosts: number;
    totalCampaigns: number;
    activeCampaigns: number;
    connectedPlatforms: number;
  };
  metrics: {
    totalReach: number;
    reachChange: number;
    totalEngagements: number;
    engagementChange: number;
    totalImpressions: number;
    impressionChange: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    engagementRate: number;
  };
  platformBreakdown: Array<{
    platform: string;
    engagements: number;
    impressions: number;
    posts: number;
  }>;
  recentPosts: Post[];
  topPosts: Array<{
    id: string;
    content: string;
    engagements: number;
    reach: number;
  }>;
  subscription: {
    plan: string;
    status: string;
    postsUsed: number;
    postsLimit: number;
    platformsUsed: number;
    platformsLimit: number;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change: number;
}

interface PostCardProps {
  post: Post;
}

type TabId = 'overview' | 'posts' | 'analytics' | 'billing';

export default function Dashboard() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/dashboard/stats?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [period])

  // Sync analytics from social platforms
  const syncAnalytics = async () => {
    try {
      setIsSyncing(true)
      await fetch('/api/analytics/sync', { method: 'POST' })
      await fetchDashboardData()
    } catch (error) {
      console.error('Failed to sync analytics:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const StatCard = ({ title, value, icon: Icon, change }: StatCardProps) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% from last period
          </p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  )

  const PostCard = ({ post }: PostCardProps) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="font-medium text-gray-900 line-clamp-2">{post.content}</p>
          <div className="flex gap-1 mt-2">
            {post.platforms.map((platform) => (
              <span key={platform} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                {platform}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className={`px-2 py-1 text-xs rounded-full ${
            post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
            post.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
            post.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {post.status.toLowerCase()}
          </span>
        </div>
      </div>

      {post.analytics && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500">
              <Eye className="w-3 h-3" />
              <span className="text-xs">Reach</span>
            </div>
            <p className="font-semibold text-sm">{post.analytics.reach.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500">
              <Heart className="w-3 h-3" />
              <span className="text-xs">Engagements</span>
            </div>
            <p className="font-semibold text-sm">{post.analytics.engagements.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500">
              <Zap className="w-3 h-3" />
              <span className="text-xs">Impressions</span>
            </div>
            <p className="font-semibold text-sm">{post.analytics.impressions.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        <a href={`/dashboard/posts/${post.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
          View Details
        </a>
      </div>
    </div>
  )

  // Loading state
  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = dashboardData?.stats || {
    totalPosts: 0,
    publishedPosts: 0,
    scheduledPosts: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    connectedPlatforms: 0,
  }

  const metrics = dashboardData?.metrics || {
    totalReach: 0,
    reachChange: 0,
    totalEngagements: 0,
    engagementChange: 0,
    totalImpressions: 0,
    impressionChange: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    engagementRate: 0,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as '7d' | '30d' | '90d')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={syncAnalytics}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                title="Sync analytics from platforms"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600" title="Notifications">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600" title="Settings">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.firstName?.[0] || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview' as TabId, label: 'Overview' },
              { id: 'posts' as TabId, label: 'Posts' },
              { id: 'analytics' as TabId, label: 'Analytics' },
              { id: 'billing' as TabId, label: 'Billing' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Reach"
                value={metrics.totalReach.toLocaleString()}
                icon={Users}
                change={metrics.reachChange}
              />
              <StatCard
                title="Total Engagements"
                value={metrics.totalEngagements.toLocaleString()}
                icon={Heart}
                change={metrics.engagementChange}
              />
              <StatCard
                title="Published Posts"
                value={stats.publishedPosts}
                icon={BarChart3}
                change={0}
              />
              <StatCard
                title="Engagement Rate"
                value={`${metrics.engagementRate}%`}
                icon={TrendingUp}
                change={0}
              />
            </div>

            {/* Subscription Usage */}
            {dashboardData?.subscription && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Usage This Month</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Posts</span>
                      <span className="font-medium">
                        {dashboardData.subscription.postsUsed} / {dashboardData.subscription.postsLimit === 999999 ? 'Unlimited' : dashboardData.subscription.postsLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (dashboardData.subscription.postsUsed / dashboardData.subscription.postsLimit) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Connected Platforms</span>
                      <span className="font-medium">
                        {dashboardData.subscription.platformsUsed} / {dashboardData.subscription.platformsLimit === 999999 ? 'Unlimited' : dashboardData.subscription.platformsLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (dashboardData.subscription.platformsUsed / dashboardData.subscription.platformsLimit) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Platform Breakdown */}
            {dashboardData?.platformBreakdown && dashboardData.platformBreakdown.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Performance by Platform</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {dashboardData.platformBreakdown.map((platform) => (
                    <div key={platform.platform} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 capitalize">{platform.platform}</p>
                      <p className="text-xl font-bold text-gray-900">{platform.engagements.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{platform.posts} posts</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Posts */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
                <a href="/dashboard/create/text" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Post
                </a>
              </div>
              {dashboardData?.recentPosts && dashboardData.recentPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.recentPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-4">Create your first post to start going viral!</p>
                  <a href="/dashboard/create/text" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Post
                  </a>
                </div>
              )}
            </div>

            {/* Top Performing Posts */}
            {dashboardData?.topPosts && dashboardData.topPosts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Posts</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Post</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagements</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reach</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dashboardData.topPosts.map((post, index) => (
                        <tr key={post.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                              <span className="text-gray-900">{post.content}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-900 font-medium">{post.engagements.toLocaleString()}</td>
                          <td className="px-6 py-4 text-gray-900">{post.reach.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">All Posts</h2>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <a href="/dashboard/create/text" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Post
                </a>
              </div>
            </div>

            {dashboardData?.recentPosts && dashboardData.recentPosts.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Content
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Platforms
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Engagements
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.recentPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">{post.content}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-1">
                              {post.platforms.map((platform) => (
                                <span key={platform} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                                  {platform}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                              post.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                              post.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {post.status.toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {post.analytics?.engagements.toLocaleString() || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <a href={`/dashboard/posts/${post.id}`} className="text-blue-600 hover:text-blue-700 mr-3">View</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">Create your first post to start going viral!</p>
                <a href="/dashboard/create/text" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Post
                </a>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Analytics Overview</h2>
              <button
                onClick={syncAnalytics}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync Analytics
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{metrics.totalImpressions.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Impressions</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{metrics.totalLikes.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Likes</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <MoreHorizontal className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{metrics.totalComments.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Comments</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <Share2 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{metrics.totalShares.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Shares</p>
              </div>
            </div>

            {/* Platform Performance */}
            {dashboardData?.platformBreakdown && dashboardData.platformBreakdown.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Platform Performance</h3>
                <div className="space-y-4">
                  {dashboardData.platformBreakdown.map((platform) => {
                    const maxEngagement = Math.max(...dashboardData.platformBreakdown.map(p => p.engagements));
                    const percentage = maxEngagement > 0 ? (platform.engagements / maxEngagement) * 100 : 0;
                    return (
                      <div key={platform.platform}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 capitalize font-medium">{platform.platform}</span>
                          <span className="text-gray-600">{platform.engagements.toLocaleString()} engagements</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Engagement Rate Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{metrics.engagementRate}%</p>
                  <p className="text-sm text-gray-600 mt-1">Engagement Rate</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{metrics.totalReach.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Reach</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">{stats.publishedPosts}</p>
                  <p className="text-sm text-gray-600 mt-1">Posts Published</p>
                </div>
              </div>
            </div>

            {metrics.totalImpressions === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                <h3 className="font-medium text-yellow-800 mb-2">No Analytics Data Yet</h3>
                <p className="text-yellow-700 text-sm mb-4">
                  Connect your social media accounts and publish posts to start tracking analytics.
                </p>
                <a href="/dashboard/connect" className="text-yellow-800 underline font-medium">
                  Connect Platforms
                </a>
              </div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Billing & Subscription</h2>

            {dashboardData?.subscription && (
              <>
                {/* Current Plan */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Current Plan</h3>
                      <p className="text-sm text-gray-600">Manage your subscription</p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      dashboardData.subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                      dashboardData.subscription.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {dashboardData.subscription.status}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-bold text-gray-900">{dashboardData.subscription.plan}</span>
                    <span className="text-gray-600">plan</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Posts This Month</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {dashboardData.subscription.postsUsed} / {dashboardData.subscription.postsLimit === 999999 ? '∞' : dashboardData.subscription.postsLimit}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Connected Platforms</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {dashboardData.subscription.platformsUsed} / {dashboardData.subscription.platformsLimit === 999999 ? '∞' : dashboardData.subscription.platformsLimit}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <a href="/pricing" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Upgrade Plan
                    </a>
                    {dashboardData.subscription.status !== 'inactive' && (
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Manage Billing
                      </button>
                    )}
                  </div>
                </div>

                {/* Plan Features */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Plan Features</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">Cross-platform posting</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">Post scheduling</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">Viral optimization suggestions</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">Analytics & performance tracking</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}