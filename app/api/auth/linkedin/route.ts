// app/api/auth/linkedin/route.ts
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
      // Start OAuth flow
      const linkedinAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
      linkedinAuthUrl.searchParams.set('response_type', 'code')
      linkedinAuthUrl.searchParams.set('client_id', process.env.LINKEDIN_CLIENT_ID!)
      linkedinAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin`)
      linkedinAuthUrl.searchParams.set('scope', 'openid profile email w_member_social')

      return NextResponse.redirect(linkedinAuthUrl.toString())
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin`
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info')
    }

    const linkedinUser = await userResponse.json()

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
          platform: 'linkedin'
        }
      },
      create: {
        userId: user.id,
        platform: 'linkedin',
        platformUserId: linkedinUser.sub,
        accountName: `${linkedinUser.given_name} ${linkedinUser.family_name}`,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        isConnected: true,
        profileUrl: `https://linkedin.com/in/${linkedinUser.sub}`,
        profileImageUrl: linkedinUser.picture,
        connectedAt: new Date(),
        metadata: {},
        isActive: true
      },
      update: {
        accessToken: tokens.access_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        accountName: `${linkedinUser.given_name} ${linkedinUser.family_name}`,
        isConnected: true,
        profileImageUrl: linkedinUser.picture,
        connectedAt: new Date()
      }
    })

    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'PLATFORM_SUCCESS', 
              platform: 'linkedin' 
            }, '${process.env.NEXT_PUBLIC_APP_URL}');
            window.close();
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })

  } catch (error) {
    console.error('LinkedIn auth error:', error)
    
    return new Response(`
      <html>
    `, { headers: { 'Content-Type': 'text/html' } })
  }
}