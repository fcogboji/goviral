"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface AccountInfo {
  username: string
  displayName: string
  profileImage?: string
  followers?: number
  posts?: number
}

interface Platform {
  name: string
  displayName: string
  icon: string
  color: string
  isConnected: boolean
  isActive: boolean
  canConnect: boolean
  accountInfo?: AccountInfo
  lastSync?: string
  error?: string
}

interface IntegrationLimits {
  maxPlatforms: number
  used: number
  remaining: number
}

interface PlatformData {
  name: string
  isConnected: boolean
  isActive: boolean
  accountInfo?: AccountInfo
  lastSync?: string
  error?: string
}

interface ApiResponse {
  platforms: PlatformData[]
  limits: IntegrationLimits
}

export default function PlatformIntegrations() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [limits, setLimits] = useState<IntegrationLimits>({ maxPlatforms: 3, used: 0, remaining: 3 })
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [syncInProgress, setSyncInProgress] = useState<string | null>(null)

  // Load platform integrations
  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/platforms/integrate')
      const data: ApiResponse = await response.json()

      // Check if the response contains an error
      if (!response.ok || !data.platforms || !data.limits) {
        console.error('API error:', data)
        setLoading(false)
        return
      }

      const platformData: Platform[] = [
        {
          name: 'instagram',
          displayName: 'Instagram',
          icon: '📸',
          color: 'bg-gradient-to-r from-purple-500 to-pink-500',
          isConnected: data.platforms.find((p) => p.name === 'instagram')?.isConnected || false,
          isActive: data.platforms.find((p) => p.name === 'instagram')?.isActive || false,
          canConnect: data.limits.remaining > 0 || data.platforms.find((p) => p.name === 'instagram')?.isConnected || false,
          accountInfo: data.platforms.find((p) => p.name === 'instagram')?.accountInfo,
          lastSync: data.platforms.find((p) => p.name === 'instagram')?.lastSync,
          error: data.platforms.find((p) => p.name === 'instagram')?.error
        },
        {
          name: 'facebook',
          displayName: 'Facebook',
          icon: '📘',
          color: 'bg-gradient-to-r from-blue-500 to-blue-600',
          isConnected: data.platforms.find((p) => p.name === 'facebook')?.isConnected || false,
          isActive: data.platforms.find((p) => p.name === 'facebook')?.isActive || false,
          canConnect: data.limits.remaining > 0 || data.platforms.find((p) => p.name === 'facebook')?.isConnected || false,
          accountInfo: data.platforms.find((p) => p.name === 'facebook')?.accountInfo,
          lastSync: data.platforms.find((p) => p.name === 'facebook')?.lastSync,
          error: data.platforms.find((p) => p.name === 'facebook')?.error
        },
        {
          name: 'twitter',
          displayName: 'Twitter',
          icon: '🐦',
          color: 'bg-gradient-to-r from-blue-400 to-blue-500',
          isConnected: data.platforms.find((p) => p.name === 'twitter')?.isConnected || false,
          isActive: data.platforms.find((p) => p.name === 'twitter')?.isActive || false,
          canConnect: data.limits.remaining > 0 || data.platforms.find((p) => p.name === 'twitter')?.isConnected || false,
          accountInfo: data.platforms.find((p) => p.name === 'twitter')?.accountInfo,
          lastSync: data.platforms.find((p) => p.name === 'twitter')?.lastSync,
          error: data.platforms.find((p) => p.name === 'twitter')?.error
        },
        {
          name: 'linkedin',
          displayName: 'LinkedIn',
          icon: '💼',
          color: 'bg-gradient-to-r from-blue-600 to-blue-700',
          isConnected: data.platforms.find((p) => p.name === 'linkedin')?.isConnected || false,
          isActive: data.platforms.find((p) => p.name === 'linkedin')?.isActive || false,
          canConnect: data.limits.remaining > 0 || data.platforms.find((p) => p.name === 'linkedin')?.isConnected || false,
          accountInfo: data.platforms.find((p) => p.name === 'linkedin')?.accountInfo,
          lastSync: data.platforms.find((p) => p.name === 'linkedin')?.lastSync,
          error: data.platforms.find((p) => p.name === 'linkedin')?.error
        },
        {
          name: 'tiktok',
          displayName: 'TikTok',
          icon: '🎵',
          color: 'bg-gradient-to-r from-black to-gray-800',
          isConnected: data.platforms.find((p) => p.name === 'tiktok')?.isConnected || false,
          isActive: data.platforms.find((p) => p.name === 'tiktok')?.isActive || false,
          canConnect: data.limits.remaining > 0 || data.platforms.find((p) => p.name === 'tiktok')?.isConnected || false,
          accountInfo: data.platforms.find((p) => p.name === 'tiktok')?.accountInfo,
          lastSync: data.platforms.find((p) => p.name === 'tiktok')?.lastSync,
          error: data.platforms.find((p) => p.name === 'tiktok')?.error
        },
        {
          name: 'youtube',
          displayName: 'YouTube',
          icon: '📺',
          color: 'bg-gradient-to-r from-red-500 to-red-600',
          isConnected: data.platforms.find((p) => p.name === 'youtube')?.isConnected || false,
          isActive: data.platforms.find((p) => p.name === 'youtube')?.isActive || false,
          canConnect: data.limits.remaining > 0 || data.platforms.find((p) => p.name === 'youtube')?.isConnected || false,
          accountInfo: data.platforms.find((p) => p.name === 'youtube')?.accountInfo,
          lastSync: data.platforms.find((p) => p.name === 'youtube')?.lastSync,
          error: data.platforms.find((p) => p.name === 'youtube')?.error
        }
      ]
      
      setPlatforms(platformData)
      setLimits(data.limits)
    } catch (error) {
      console.error('Failed to load integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectPlatform = async (platformName: string) => {
    setConnecting(platformName)

    try {
      // Open OAuth window
      const width = 600
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      const authWindow = window.open(
        `/api/auth/${platformName}`,
        `${platformName}_auth`,
        `width=${width},height=${height},left=${left},top=${top}`
      )

      // Listen for OAuth callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return

        if (event.data.type === 'PLATFORM_SUCCESS' && event.data.platform === platformName) {
          window.removeEventListener('message', handleMessage)
          // Reload integrations to get fresh data
          await loadIntegrations()
        } else if (event.data.type === 'PLATFORM_ERROR') {
          window.removeEventListener('message', handleMessage)
          setPlatforms(platforms.map(platform =>
            platform.name === platformName
              ? { ...platform, error: event.data.error || 'Connection failed' }
              : platform
          ))
        }

        setConnecting(null)
      }

      window.addEventListener('message', handleMessage)

      // Handle window closed without completing auth
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          setConnecting(null)
        }
      }, 500)
    } catch (error) {
      console.error(`Failed to connect ${platformName}:`, error)
      setPlatforms(platforms.map(platform =>
        platform.name === platformName
          ? { ...platform, error: 'Connection failed' }
          : platform
      ))
      setConnecting(null)
    }
  }

  const disconnectPlatform = async (platformName: string) => {
    try {
      await fetch('/api/platforms/integrate', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformName })
      })
      
      setPlatforms(platforms.map(platform => 
        platform.name === platformName 
          ? { 
              ...platform, 
              isConnected: false, 
              isActive: false,
              accountInfo: undefined,
              lastSync: undefined,
              error: undefined
            }
          : platform
      ))
      
      // Update limits
      setLimits(prev => ({
        ...prev,
        used: prev.used - 1,
        remaining: prev.remaining + 1
      }))
    } catch (error) {
      console.error(`Failed to disconnect ${platformName}:`, error)
    }
  }

  const syncPlatform = async (platformName: string) => {
    setSyncInProgress(platformName)
    try {
      const response = await fetch('/api/platforms/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformName })
      })

      if (!response.ok) {
        throw new Error('Sync failed')
      }

      // Reload integrations to get fresh data
      await loadIntegrations()
    } catch (error) {
      console.error(`Failed to sync ${platformName}:`, error)
      setPlatforms(platforms.map(platform =>
        platform.name === platformName
          ? { ...platform, error: 'Sync failed' }
          : platform
      ))
    } finally {
      setSyncInProgress(null)
    }
  }

  const getStatusIcon = (platform: Platform) => {
    if (platform.error) {
      return <XCircle className="w-5 h-5 text-red-500" />
    }
    if (platform.isConnected && platform.isActive) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    if (platform.isConnected && !platform.isActive) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
    return <XCircle className="w-5 h-5 text-gray-400" />
  }

  const getStatusText = (platform: Platform) => {
    if (platform.error) {
      return 'Error'
    }
    if (platform.isConnected && platform.isActive) {
      return 'Connected'
    }
    if (platform.isConnected && !platform.isActive) {
      return 'Inactive'
    }
    return 'Not Connected'
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading platform integrations...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Integrations</h1>
          <p className="text-gray-600">Connect your social media accounts to start posting</p>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Advanced settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Limits Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-900">Platform Limits</h3>
            <p className="text-sm text-blue-700">
              {limits.used} of {limits.maxPlatforms} platforms connected
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-blue-900">{limits.remaining} remaining</p>
            <p className="text-xs text-blue-600">Upgrade plan for more</p>
          </div>
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <div key={platform.name} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Platform Header */}
            <div className={`${platform.color} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{platform.icon}</span>
                  <div>
                    <h3 className="font-semibold">{platform.displayName}</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(platform)}
                      <span className="text-sm opacity-90">{getStatusText(platform)}</span>
                    </div>
                  </div>
                </div>
                {platform.isConnected && (
                  <button
                    onClick={() => disconnectPlatform(platform.name)}
                    className="text-white hover:text-red-200 transition-colors"
                    title="Disconnect"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Platform Content */}
            <div className="p-4">
              {platform.isConnected && platform.accountInfo ? (
                <div className="space-y-3">
                  {/* Account Info */}
                  <div className="flex items-center space-x-3">
                    {platform.accountInfo.profileImage ? (
                      <Image
                        src={platform.accountInfo.profileImage}
                        alt={`${platform.accountInfo.displayName} profile`}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-sm">{platform.accountInfo.displayName[0]}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{platform.accountInfo.displayName}</p>
                      <p className="text-sm text-gray-600">{platform.accountInfo.username}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Followers</p>
                      <p className="font-semibold text-gray-900">
                        {platform.accountInfo.followers?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Posts</p>
                      <p className="font-semibold text-gray-900">
                        {platform.accountInfo.posts?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Last Sync */}
                  {platform.lastSync && (
                    <div className="text-xs text-gray-500">
                      Last synced: {formatDate(platform.lastSync)}
                    </div>
                  )}

                  {/* Error Message */}
                  {platform.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">{platform.error}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => syncPlatform(platform.name)}
                      disabled={syncInProgress === platform.name}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {syncInProgress === platform.name ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Sync</span>
                        </>
                      )}
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="View on platform"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">
                    Connect your {platform.displayName} account to start posting
                  </p>
                  <button
                    onClick={() => connectPlatform(platform.name)}
                    disabled={!platform.canConnect || connecting === platform.name}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                  >
                    {connecting === platform.name ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                  {!platform.canConnect && (
                    <p className="text-xs text-red-600 mt-2">
                      Platform limit reached. Upgrade your plan.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <div>
                  <span className="text-sm text-gray-700">Auto-sync every hour</span>
                  <p className="text-xs text-gray-500">Automatically sync data from connected platforms</p>
                </div>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <div>
                  <span className="text-sm text-gray-700">Post to all connected platforms</span>
                  <p className="text-xs text-gray-500">Default to posting on all active platforms</p>
                </div>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <div>
                  <span className="text-sm text-gray-700">Show analytics from all platforms</span>
                  <p className="text-xs text-gray-500">Include data from all connected platforms in analytics</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}