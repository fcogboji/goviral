// app/dashboard/connect/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Facebook, Twitter, Instagram, Linkedin, Youtube, CheckCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'

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
    description: 'Connect your Facebook page to schedule posts and manage content'
  },
  twitter: {
    name: 'Twitter/X',
    icon: Twitter,
    color: 'bg-black',
    description: 'Connect your Twitter account to schedule tweets and engage with followers'
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: 'Connect your Instagram business account to share photos and stories'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700',
    description: 'Connect your LinkedIn profile or company page for professional content'
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: 'bg-red-600',
    description: 'Connect your YouTube channel to manage video content and community posts'
  }
}

export default function ConnectAccountsPage() {
  const { user, isLoaded } = useUser()
  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && user) {
      fetchIntegrations()
    }
  }, [isLoaded, user])

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

  const handleConnect = async (platform: string) => {
    setConnectingPlatform(platform)
    setError(null)

    try {
      // Open OAuth popup
      const popup = window.open(
        `/api/auth/${platform}`,
        `${platform}_auth`,
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.')
      }

      // Listen for messages from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return

        if (event.data.type === 'PLATFORM_SUCCESS') {
          popup.close()
          window.removeEventListener('message', handleMessage)
          fetchIntegrations() // Refresh integrations
          setConnectingPlatform(null)
        } else if (event.data.type === 'PLATFORM_ERROR') {
          popup.close()
          window.removeEventListener('message', handleMessage)
          setError(event.data.error || `Failed to connect ${platform}`)
          setConnectingPlatform(null)
        }
      }

      window.addEventListener('message', handleMessage)

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          setConnectingPlatform(null)
        }
      }, 1000)

    } catch (err) {
      console.error('Error connecting platform:', err)
      setError(err instanceof Error ? err.message : `Failed to connect ${platform}`)
      setConnectingPlatform(null)
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
      
      fetchIntegrations() // Refresh integrations
    } catch (err) {
      console.error('Error disconnecting platform:', err)
      setError(`Failed to disconnect ${platform}`)
    }
  }

  const getIntegrationForPlatform = (platform: string) => {
    return integrations.find(integration => integration.platform === platform)
  }

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
          Connect your social media accounts to start scheduling and managing your content across all platforms.
        </p>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(platformConfig).map(([platform, config]) => {
          const integration = getIntegrationForPlatform(platform)
          const Icon = config.icon
          const isConnecting = connectingPlatform === platform

          return (
            <Card key={platform} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                      {integration?.isConnected && (
                        <Badge variant="secondary" className="mt-1">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
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
                        Connected on {new Date(integration.connectedAt).toLocaleDateString()}
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
                    onClick={() => handleConnect(platform)}
                    disabled={isConnecting}
                    className="w-full"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      `Connect ${config.name}`
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {integrations.some(i => i.isConnected) && (
        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-medium text-green-900 mb-2">Connected Accounts</h3>
          <p className="text-sm text-green-700">
            You have {integrations.filter(i => i.isConnected).length} account(s) connected. 
            You can now start creating and scheduling posts across all your connected platforms!
          </p>
        </div>
      )}
    </div>
  )
}