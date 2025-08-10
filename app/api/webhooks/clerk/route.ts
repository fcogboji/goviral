import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

type ClerkUserEventData = {
  id: string
  email_addresses?: Array<{ email_address?: string }>
  first_name?: string
  last_name?: string
  image_url?: string
}

type VerifiedEvent = {
  type: string
  data: ClerkUserEventData
}

export async function POST(request: NextRequest) {
  try {
    const svixId = request.headers.get('svix-id')
    const svixTimestamp = request.headers.get('svix-timestamp')
    const svixSignature = request.headers.get('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 })
    }

    const payload = await request.text()
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

    let evt: VerifiedEvent
    try {
      evt = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as VerifiedEvent
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const eventType = evt.type
    const data = evt.data

    if (eventType === 'user.created' || eventType === 'user.updated') {
      await prisma.user.upsert({
        where: { clerkId: data.id },
        update: {
          email: data.email_addresses?.[0]?.email_address || '',
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          imageUrl: data.image_url || '',
        },
        create: {
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address || '',
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          imageUrl: data.image_url || '',
        },
      })
    }

    if (eventType === 'user.deleted') {
      try {
        await prisma.user.delete({ where: { clerkId: data.id } })
      } catch {
        // ignore if already deleted
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clerk webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 })
  }
}