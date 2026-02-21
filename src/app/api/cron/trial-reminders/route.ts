// Cron job: send reminders to users whose trial is ending in 2 days
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Window: trials ending between 1 and 3 days from now
    const reminderStart = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
    const reminderEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    const expiringTrials = await prisma.subscription.findMany({
      where: {
        status: 'trial',
        trialEndsAt: {
          gte: reminderStart,
          lte: reminderEnd,
        },
        cancelAtPeriodEnd: false, // Don't remind if they already cancelled
      },
      include: {
        user: true,
        plan: true,
      },
    })

    let remindersCreated = 0

    for (const sub of expiringTrials) {
      const daysLeft = Math.ceil(
        ((sub.trialEndsAt?.getTime() ?? 0) - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Only create reminder if we haven't already sent one today
      const existingReminder = await prisma.notification.findFirst({
        where: {
          userId: sub.userId,
          message: { contains: 'trial ending' },
          createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
        },
      })

      if (existingReminder) continue

      const planPrice = sub.plan?.price ?? 0

      await prisma.notification.create({
        data: {
          userId: sub.userId,
          message: `⏰ Your free trial is ending in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}! Your card will be charged $${planPrice}/month for the ${sub.planType} plan. You can cancel anytime from Settings.`,
          type: 'in-app',
        },
      })

      remindersCreated++

      // TODO: Send email reminder via Resend when email service is configured
      // await sendTrialReminderEmail(sub.user.email, sub.planType, daysLeft, planPrice)
    }

    console.log(`Trial reminders: ${remindersCreated} sent out of ${expiringTrials.length} expiring trials`)

    return NextResponse.json({
      success: true,
      message: `Processed ${expiringTrials.length} expiring trials, sent ${remindersCreated} reminders`,
    })
  } catch (error) {
    console.error('Error sending trial reminders:', error)
    return NextResponse.json(
      { error: 'Failed to process trial reminders' },
      { status: 500 }
    )
  }
}

