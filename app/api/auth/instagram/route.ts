// app/api/auth/instagram/route.ts
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
      // Start Instagram Basic Display API OAuth flow
      const instagramAuthUrl = new URL('https://api.instagram.com/oauth/authorize')
      instagramAuthUrl.searchParams.set('client_id', process.env.INSTAGRAM_CLIENT_ID!)
      instagramAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram`)
      instagramAuthUrl.searchParams.set('scope', 'user_profile,user_media')
      instagramAuthUrl.searchParams.set('response_type', 'code')

      return NextResponse.redirect(instagramAuthUrl.toString())
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID!,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram`,
        code
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokens = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${tokens.access_token}`)
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info')
    }

    const instagramUser = await userResponse.json()

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
          platform: 'instagram'
        }
      },
      create: {
        userId: user.id,
        platform: 'instagram',
        platformUserId: instagramUser.id,
        accountName: `@${instagramUser.username}`,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        isConnected: true,
        profileUrl: `https://instagram.com/${instagramUser.username}`,
        profileImageUrl: null,
        connectedAt: new Date(),
        metadata: {},
        isActive: true
      },
      update: {
        accessToken: tokens.access_token,
        accountName: `@${instagramUser.username}`,
        isConnected: true,
        connectedAt: new Date()
      }
    })

    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'PLATFORM_SUCCESS', 
              platform: 'instagram' 
            }, '${process.env.NEXT_PUBLIC_APP_URL}');
            window.close();
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })

  } catch (error) {
    console.error('Instagram auth error:', error)
    
    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'PLATFORM_ERROR', 
              error: 'Failed to connect Instagram' 
            }, '${process.env.NEXT_PUBLIC_APP_URL}');
            window.close();
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })
  }
}