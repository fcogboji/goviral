// app/dashboard/connect/page.tsx
// Connect social media accounts via Ayrshare — ONE link connects all platforms
'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Facebook, Twitter, Instagram, Linkedin, Youtube, CheckCircle, AlertCircle, ExternalLink, RefreshCw, Link2 } from 'lucide-react'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

interface PlatformIntegration {
  id: string
  platform: string
  accountName: string
  isConnected: boolean
  profileUrl?: string
  profileImageUrl?: string
  connectedAt?: string
  expiresAt?: string
}

const platformConfig = {
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600',
    description: 'Schedule posts and manage your Facebook page content'
  },
  twitter: {
    name: 'Twitter/X',
    icon: Twitter,
    color: 'bg-black',
    description: 'Schedule tweets and engage with followers'
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: 'Share photos, reels, and stories to Instagram'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700',
    description: 'Publish professional content to LinkedIn'
  },
  tiktok: {
    name: 'TikTok',
    icon: () => (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ),
    color: 'bg-black',
    description: 'Share short-form videos on TikTok'
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: 'bg-red-600',
    description: 'Upload videos and YouTube Shorts'
  }
}

export default function ConnectAccountsPage() {
  const { user, isLoaded } = useUser()
  const searchParams = useSearchParams()
  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [highlightedPlatform, setHighlightedPlatform] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && user) {
      fetchIntegrations()

      // Check if a specific platform was clicked from the landing page
      const platformParam = searchParams.get('platform')
      if (platformParam) {
        setHighlightedPlatform(platformParam)
        setTimeout(() => {
          const element = document.getElementById(`platform-${platformParam}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 500)
        setTimeout(() => {
          setHighlightedPlatform(null)
        }, 3500)
      }
    }
  }, [isLoaded, user, searchParams])

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/platforms/integrations')
      if (!response.ok) throw new Error('Failed to fetch integrations')
      const data = await response.json()
      setIntegrations(data.integrations || [])
    } catch (err) {
      console.error('Error fetching integrations:', err)
      setError('Failed to load connected accounts')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Open Ayrshare's linking page where users can connect ALL their social accounts.
   * No individual OAuth flows needed — one page handles everything!
   */
  const handleConnectAll = async () => {
    setConnecting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Get the Ayrshare linking URL from our API
      const response = await fetch('/api/platforms/link')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to get linking URL')
      }

      const { url } = await response.json()

      // Open the linking page in a popup
      const popup = window.open(
        url,
        'connect_accounts',
        'width=700,height=800,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.')
      }

      // Poll to check when popup is closed
      const checkClosed = setInterval(async () => {
        if (popup.closed) {
          clearInterval(checkClosed)
          setConnecting(false)

          // Sync connected platforms from Ayrshare after the popup closes
          await handleSyncPlatforms()
        }
      }, 1000)
    } catch (err) {
      console.error('Error opening linking page:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect accounts')
      setConnecting(false)
    }
  }

  /**
   * Sync connected platforms from Ayrshare back to our database.
   */
  const handleSyncPlatforms = async () => {
    setSyncing(true)
    setError(null)

    try {
      const response = await fetch('/api/platforms/link', { method: 'POST' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to sync platforms')
      }

      const data = await response.json()
      setSuccessMessage(data.message || 'Platforms synced successfully!')

      // Refresh the integrations list
      await fetchIntegrations()

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err) {
      console.error('Error syncing platforms:', err)
      setError(err instanceof Error ? err.message : 'Failed to sync platforms')
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platformConfig[platform as keyof typeof platformConfig]?.name}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/platforms/${platform}/disconnect`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to disconnect')

      // Re-sync from Ayrshare
      await handleSyncPlatforms()
    } catch (err) {
      console.error('Error disconnecting platform:', err)
      setError(`Failed to disconnect ${platform}`)
    }
  }

  const getIntegrationForPlatform = (platform: string) => {
    return integrations.find(integration => integration.platform === platform)
  }

  const connectedCount = integrations.filter(i => i.isConnected).length

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Connect Your Accounts</h1>
        <p className="text-gray-600">
          Connect all your social media accounts in one click. We handle the rest — no
          individual platform APIs or developer accounts needed.
        </p>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Main Connect All Button */}
      <Card className="mb-8 border-2 border-dashed border-blue-300 bg-blue-50/50">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {connectedCount > 0 ? 'Connect More Accounts' : 'Connect Your Social Accounts'}
          </h2>
          <p className="text-gray-600 text-center mb-4 max-w-md">
            Click below to open the account linking page. You can connect Facebook, Twitter/X,
            Instagram, LinkedIn, TikTok, YouTube, and more — all from one place.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleConnectAll}
              disabled={connecting}
              size="lg"
              className="px-8"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {connectedCount > 0 ? 'Manage Connections' : 'Connect Accounts'}
                </>
              )}
            </Button>

            {connectedCount > 0 && (
              <Button
                onClick={handleSyncPlatforms}
                disabled={syncing}
                variant="outline"
                size="lg"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Platform Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(platformConfig).map(([platform, config]) => {
          const integration = getIntegrationForPlatform(platform)
          const Icon = config.icon
          const isHighlighted = highlightedPlatform === platform

          return (
            <Card
              key={platform}
              id={`platform-${platform}`}
              className={`relative overflow-hidden transition-all duration-300 ${
                isHighlighted ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                      {integration?.isConnected ? (
                        <Badge variant="secondary" className="mt-1">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-1 text-gray-500">
                          Not connected
                        </Badge>
                      )}
                    </div>
                  </div>

                  {integration?.profileImageUrl && (
                    <Image
                      src={integration.profileImageUrl}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                </div>

                <CardDescription className="mt-2">
                  {config.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {integration?.isConnected ? (
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{integration.accountName}</p>
                      {integration.profileUrl && (
                        <a
                          href={integration.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Profile
                        </a>
                      )}
                    </div>

                    {integration.connectedAt && (
                      <p className="text-sm text-gray-500">
                        Connected on {formatDate(integration.connectedAt)}
                      </p>
                    )}

                    <Button
                      onClick={() => handleDisconnect(platform)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleConnectAll}
                    disabled={connecting}
                    variant="outline"
                    className="w-full"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4 mr-2" />
                        Connect {config.name}
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {connectedCount > 0 && (
        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-medium text-green-900 mb-2">Connected Accounts</h3>
          <p className="text-sm text-green-700">
            You have {connectedCount} account(s) connected.
            You can now start creating and scheduling posts across all your connected platforms!
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="font-medium text-gray-900 mb-2">Supported Platforms</h3>
        <p className="text-sm text-gray-600">
          GoViral supports 15+ social platforms including Facebook, Twitter/X, Instagram,
          LinkedIn, TikTok, YouTube, Pinterest, Reddit, Threads, Telegram, and more.
          Click &quot;Connect Accounts&quot; above to link any of them.
        </p>
      </div>
    </div>
  )
}
