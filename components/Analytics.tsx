"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Share2,
  Calendar,
  Eye,
  Filter,
  Download
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface AnalyticsData {
  totalPosts: number
  totalEngagement: number | null
  totalReach: number | null
  totalLikes: number | null
  totalComments: number | null
  totalShares: number | null
  platformPerformance?: Array<{
    platform: string
    posts: number
    engagement: number | null
    reach: number | null
  }>
  recentPosts?: Array<{
    id: string
    content: string
    platform: string
    engagement: number | null
    reach: number | null
    date: string
  }>
}

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: number
  subtitle?: string
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('30d')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        period,
        ...(selectedPlatform !== 'all' && { platform: selectedPlatform })
      })
      
      const response = await fetch(`/api/analytics?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err) {
      setError('Failed to load analytics data')
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [period, selectedPlatform])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const StatCard = ({ title, value, icon: Icon, change, subtitle }: StatCardProps) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {change !== undefined && (
            <p className="text-sm text-green-600 mt-1">+{change}% from last period</p>
          )}
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  )

  const formatNumber = (num: number | undefined | null): string => {
    // Handle undefined, null, or invalid numbers
    if (num == null || isNaN(num)) {
      return '0'
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    // Use a consistent format that works on both server and client
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month} ${day}, ${hours}:${minutes}`
  }

  const calculateEngagementRate = (engagement: number | null, reach: number | null): string => {
    if (!engagement || !reach || reach === 0) {
      return '0.00%'
    }
    return ((engagement / reach) * 100).toFixed(2) + '%'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-xl h-96"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load analytics</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data</h3>
          <p className="text-gray-500">Start posting to see your analytics here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your social media performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" title="Export data">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Period:</span>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select time period"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Platform:</span>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filter by platform"
            >
              <option value="all">All Platforms</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Posts"
          value={data.totalPosts}
          icon={BarChart3}
          change={12}
        />
        <StatCard
          title="Total Reach"
          value={formatNumber(data.totalReach)}
          icon={Eye}
          change={24}
        />
        <StatCard
          title="Total Engagement"
          value={formatNumber(data.totalEngagement)}
          icon={Heart}
          change={18}
        />
        <StatCard
          title="Engagement Rate"
          value={calculateEngagementRate(data.totalEngagement, data.totalReach)}
          icon={TrendingUp}
          subtitle="Avg. engagement rate"
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">Likes</span>
              </div>
              <span className="font-semibold">{formatNumber(data.totalLikes)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Comments</span>
              </div>
              <span className="font-semibold">{formatNumber(data.totalComments)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">Shares</span>
              </div>
              <span className="font-semibold">{formatNumber(data.totalShares)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
          <div className="space-y-4">
            {data.platformPerformance && data.platformPerformance.length > 0 ? (
              data.platformPerformance.map((platform) => (
                <div key={platform.platform} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900 capitalize">{platform.platform}</span>
                    <p className="text-xs text-gray-500">{platform.posts} posts</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">{formatNumber(platform.engagement)}</span>
                    <p className="text-xs text-gray-500">{formatNumber(platform.reach)} reach</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No platform data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h3>
          <div className="space-y-4">
            {data.recentPosts && data.recentPosts.length > 0 ? (
              data.recentPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <p className="text-sm text-gray-900 line-clamp-2 mb-2">{post.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{post.platform}</span>
                    <div className="flex items-center space-x-3">
                      <span>{formatNumber(post.engagement)} engagement</span>
                      <span>{isClient ? formatDate(post.date) : 'Loading...'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent posts available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Over Time</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Chart visualization coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}