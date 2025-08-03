// app/api/auth/facebook/route.ts
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
      const facebookAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
      facebookAuthUrl.searchParams.set('client_id', process.env.FACEBOOK_APP_ID!)
      facebookAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook`)
      facebookAuthUrl.searchParams.set('scope', 'pages_manage_posts,pages_read_engagement,pages_show_list')
      facebookAuthUrl.searchParams.set('response_type', 'code')
      
      return NextResponse.redirect(facebookAuthUrl.toString())
    }

    // Exchange code for access token
    const searchParamsForToken = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook`,
      code
    })

    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?${searchParamsForToken}`
    const tokenRes = await fetch(tokenUrl)
    
    if (!tokenRes.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokens = await tokenRes.json()

    // Get user info
    const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,picture&access_token=${tokens.access_token}`)
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info')
    }

    const facebookUser = await userResponse.json()

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
          platform: 'facebook'
        }
      },
      create: {
        userId: user.id,
        platform: 'facebook',
        platformUserId: facebookUser.id,
        accountName: facebookUser.name,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        isConnected: true,
        profileUrl: `https://facebook.com/${facebookUser.id}`,
        profileImageUrl: facebookUser.picture?.data?.url,
        connectedAt: new Date(),
        metadata: {},
        isActive: true
      },
      update: {
        accessToken: tokens.access_token,
        accountName: facebookUser.name,
        isConnected: true,
        profileImageUrl: facebookUser.picture?.data?.url,
        connectedAt: new Date()
      }
    })

    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'PLATFORM_SUCCESS', 
              platform: 'facebook' 
            }, '${process.env.NEXT_PUBLIC_APP_URL}');
            window.close();
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })

  } catch (error) {
    console.error('Facebook auth error:', error)
    
    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'PLATFORM_ERROR', 
              error: 'Failed to connect Facebook' 
            }, '${process.env.NEXT_PUBLIC_APP_URL}');
            window.close();
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })
  }
}
