import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardLayoutClient from './layout-client'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Check if user has an active subscription or trial
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      subscription: {
        include: { plan: true },
      },
    },
  })

  // Blocked users cannot access
  if (user?.isBlocked) {
    redirect('/blocked')
  }

  // Allow admins through without subscription check
  const isAdmin = user?.role === 'admin'

  if (!isAdmin) {
    // No user record or no subscription → send to trial signup
    if (!user || !user.subscription) {
      redirect('/trial-signup')
    }

    // Subscription exists but is not active/trial → send to trial signup
    const validStatuses = ['active', 'trial']
    if (!validStatuses.includes(user.subscription.status)) {
      redirect('/trial-signup?expired=true')
    }

    // If trial, check it hasn't expired
    if (
      user.subscription.status === 'trial' &&
      user.subscription.trialEndsAt &&
      new Date(user.subscription.trialEndsAt) < new Date()
    ) {
      // Trial has expired — update status and redirect
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: { status: 'inactive' },
      })
      redirect('/trial-signup?expired=true')
    }
  }

  // Build subscription info to pass to the client sidebar
  const sub = user?.subscription
  const subscriptionInfo = sub
    ? {
        planName: sub.planType,
        status: sub.status as 'active' | 'trial' | 'past_due',
        trialEndsAt: sub.trialEndsAt?.toISOString() || null,
        currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      }
    : null

  return (
    <DashboardLayoutClient subscriptionInfo={subscriptionInfo}>
      {children}
    </DashboardLayoutClient>
  )
}
