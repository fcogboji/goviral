// Mark all notifications as read for the current user
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ success: true })
    }

    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

