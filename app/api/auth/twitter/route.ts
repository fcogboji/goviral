// app/api/auth/twitter/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Helper to create a base64url-encoded SHA256 hash
function createCodeChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest()
  return hash
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

// Helper to generate a base64url random string of sufficient length
function generateVerifier(bytes: number = 64): string {
  return crypto.randomBytes(bytes).toString('base64url')
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const returnedState = searchParams.get('state')

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
      // Start OAuth 2.0 PKCE flow
      const state = crypto.randomBytes(32).toString('hex')
      const verifier = generateVerifier(64)
      const challenge = createCodeChallenge(verifier)

      const twitterAuthUrl = new URL('https://twitter.com/i/oauth2/authorize')
      twitterAuthUrl.searchParams.set('response_type', 'code')
      twitterAuthUrl.searchParams.set('client_id', process.env.TWITTER_CLIENT_ID!)
      twitterAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter`)
      twitterAuthUrl.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access')
      twitterAuthUrl.searchParams.set('state', state)
      twitterAuthUrl.searchParams.set('code_challenge', challenge)
      twitterAuthUrl.searchParams.set('code_challenge_method', 'S256')

      const response = NextResponse.redirect(twitterAuthUrl.toString())
      // Store state and verifier in HttpOnly cookies for validation on callback
      const cookieOptions = {
        httpOnly: true as const,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/api/auth/twitter',
        maxAge: 10 * 60, // 10 minutes
      }
      response.cookies.set('twitter_oauth_state', state, cookieOptions)
      response.cookies.set('twitter_pkce_verifier', verifier, cookieOptions)
      return response
    }

    // Validate state
    const storedState = request.cookies.get('twitter_oauth_state')?.value
    const storedVerifier = request.cookies.get('twitter_pkce_verifier')?.value

    if (!returnedState || !storedState || returnedState !== storedState) {
      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ 
                type: 'PLATFORM_ERROR', 
                error: 'Invalid OAuth state' 
              }, '${process.env.NEXT_PUBLIC_APP_URL}');
              window.close();
            </script>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } })
    }

    if (!storedVerifier) {
      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ 
                type: 'PLATFORM_ERROR', 
                error: 'Missing PKCE verifier' 
              }, '${process.env.NEXT_PUBLIC_APP_URL}');
              window.close();
            </script>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } })
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
        code_verifier: storedVerifier,
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,username', {
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
        email: `temp_${userId}@clerk.temp`,
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

    // Clear sensitive cookies
    const successResponse = new Response(`
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

    successResponse.headers.append('Set-Cookie', 'twitter_oauth_state=; Path=/api/auth/twitter; Max-Age=0; HttpOnly; SameSite=Lax')
    successResponse.headers.append('Set-Cookie', 'twitter_pkce_verifier=; Path=/api/auth/twitter; Max-Age=0; HttpOnly; SameSite=Lax')

    return successResponse

  } catch (error) {
    console.error('Twitter auth error:', error)
    const errorResponse = new Response(`
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

    errorResponse.headers.append('Set-Cookie', 'twitter_oauth_state=; Path=/api/auth/twitter; Max-Age=0; HttpOnly; SameSite=Lax')
    errorResponse.headers.append('Set-Cookie', 'twitter_pkce_verifier=; Path=/api/auth/twitter; Max-Age=0; HttpOnly; SameSite=Lax')

    return errorResponse
  }
}
