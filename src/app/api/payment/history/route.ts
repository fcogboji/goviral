// GET payment history for the current user
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
      return NextResponse.json({ payments: [] })
    }

    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        reference: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        reference: p.reference,
        createdAt: p.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Error fetching payment history:', error)
    return NextResponse.json({ payments: [] })
  }
}

