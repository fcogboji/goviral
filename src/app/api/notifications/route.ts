// GET notifications for the current user
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
      return NextResponse.json({ notifications: [], unreadCount: 0 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    })

    return NextResponse.json({
      notifications: notifications.map(n => ({
        id: n.id,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ notifications: [], unreadCount: 0 })
  }
}
