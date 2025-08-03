// app/api/auth/twitter/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

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
      // Start OAuth 2.0 flow
      const state = crypto.randomBytes(32).toString('hex')
      const codeChallenge = crypto.randomBytes(32).toString('base64url')
      
      const twitterAuthUrl = new URL('https://twitter.com/i/oauth2/authorize')
      twitterAuthUrl.searchParams.set('response_type', 'code')
      twitterAuthUrl.searchParams.set('client_id', process.env.TWITTER_CLIENT_ID!)
      twitterAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter`)
      twitterAuthUrl.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access')
      twitterAuthUrl.searchParams.set('state', state)
      twitterAuthUrl.searchParams.set('code_challenge', codeChallenge)
      twitterAuthUrl.searchParams.set('code_challenge_method', 'S256')

      return NextResponse.redirect(twitterAuthUrl.toString())
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: process.env.TWITTER_CLIENT_ID!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter`,
        code_verifier: 'challenge' // This should match the code_challenge from step 1
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info')
    }

    const twitterUser = await userResponse.json()

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
          platform: 'twitter'
        }
      },
      create: {
        userId: user.id,
        platform: 'twitter',
        platformUserId: twitterUser.data.id,
        accountName: `@${twitterUser.data.username}`,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        isConnected: true,
        profileUrl: `https://twitter.com/${twitterUser.data.username}`,
        profileImageUrl: twitterUser.data.profile_image_url,
        connectedAt: new Date(),
        metadata: {},
        isActive: true
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        accountName: `@${twitterUser.data.username}`,
        isConnected: true,
        profileImageUrl: twitterUser.data.profile_image_url,
        connectedAt: new Date()
      }
    })

    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'PLATFORM_SUCCESS', 
              platform: 'twitter' 
            }, '${process.env.NEXT_PUBLIC_APP_URL}');
            window.close();
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })

  } catch (error) {
    console.error('Twitter auth error:', error)
    
    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'PLATFORM_ERROR', 
              error: 'Failed to connect Twitter' 
            }, '${process.env.NEXT_PUBLIC_APP_URL}');
            window.close();
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })
  }
}
