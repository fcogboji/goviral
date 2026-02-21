// app/api/auth/facebook/route.ts
// Redirects to Ayrshare's unified linking page — no direct Facebook OAuth needed
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { CentralPostingService } from '@/lib/social-media'

export async function GET(_request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
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

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Get Ayrshare linking URL and redirect there
    const service = await CentralPostingService.forUser(user.id)
    const linkingUrl = await service.getLinkingUrl()

    return NextResponse.redirect(linkingUrl)
  } catch (error) {
    console.error('Facebook auth error:', error)

    return new Response(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'PLATFORM_ERROR', 
              error: 'Failed to connect Facebook. Please use the Connect Accounts button instead.' 
            }, '${process.env.NEXT_PUBLIC_APP_URL}');
            window.close();
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })
  }
}
