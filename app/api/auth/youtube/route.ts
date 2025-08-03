// app/api/auth/youtube/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!userId) {
      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ 
                type: 'PLATFORM_ERROR', 
                error: 'Authentication required' 
              }, '${process.env.NEXT_PUBLIC_APP_URL}');
              window.close();
            </script>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } })
    }

    if (!code) {
      // Start Google OAuth flow for YouTube
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!)
      googleAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube`)
      googleAuthUrl.searchParams.set('response_type', 'code')
      googleAuthUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/userinfo.profile')
      googleAuthUrl.searchParams.set('access_type', 'offline')
      googleAuthUrl.searchParams.set('prompt', 'consent')

      return NextResponse.redirect(googleAuthUrl.toString())
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube`,
        grant_type: 'authorization_code'
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await tokenResponse.json()

    // Get YouTube channel info
    const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })

    if (!channelResponse.ok) {
      throw new Error('Failed to fetch YouTube channel info')
    }

    const channelData = await channelResponse.json()
    
    if (!channelData.items || channelData.items.length === 0) {
      throw new Error('No YouTube channel found')
    }

    const channel = channelData.items[0]

    // Find or create user
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      create: {
        clerkId: userId,
        email: '',
        createdAt: new Date()
      },
      update: {}
    })

    // Create or update platform integration
    await prisma.platformIntegration.upsert({
      where: {
        userId_platform: {
          userId: user.id,
          platform: 'youtube'
        }
      },
      create: {
        userId: user.id,
        platform: 'youtube',
        platformUserId: channel.id,
        accountName: channel.snippet.title,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        isConnected: true,
        profileUrl: `https://youtube.com/channel/${channel.id}`,
        profileImageUrl: channel.snippet.thumbnails?.default?.url,
        connectedAt: new Date(),
        metadata: {},
        isActive: true
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        accountName: channel.snippet.title,
        isConnected: true,
        profileImageUrl: channel.snippet.thumbnails?.default?.url,
        connectedAt: new Date()
      }
    })

    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'PLATFORM_SUCCESS', 
              platform: 'youtube' 
            }, '${process.env.NEXT_PUBLIC_APP_URL}');
            window.close();
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })

  } catch (error) {
    console.error('YouTube auth error:', error)
    
    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'PLATFORM_ERROR', 
              error: 'Failed to connect YouTube' 
            }, '${process.env.NEXT_PUBLIC_APP_URL}');
            window.close();
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })
  }
}