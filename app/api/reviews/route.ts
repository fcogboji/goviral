import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const body = await request.json()
    const { name, role, content, rating } = body

    if (!content || (!name && !userId)) {
      return NextResponse.json({ error: 'Content and name are required' }, { status: 400 })
    }

    // If user is signed in, prefer their DB profile name
    let finalName = name as string | undefined
    if (userId) {
      const user = await prisma.user.findUnique({ where: { clerkId: userId } })
      finalName = user?.name || user?.firstName || finalName || 'Anonymous'
    }

    const review = await prisma.review.create({
      data: {
        userId: userId ? (await prisma.user.findUnique({ where: { clerkId: userId } }))?.id : null,
        name: finalName || 'Anonymous',
        role: role || '',
        content,
        rating: Math.max(1, Math.min(5, Number(rating) || 5)),
        approved: true,
      },
    })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}