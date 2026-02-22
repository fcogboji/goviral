import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sendEmail } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, message } = body

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      )
    }

    const supportEmail = process.env.SUPPORT_EMAIL || process.env.RESEND_FROM_EMAIL || 'support@goviral.com'
    const userEmail = (body.email as string) || 'unknown@goviral.com'

    await sendEmail({
      to: supportEmail,
      replyTo: userEmail,
      subject: `[GoViral Support] ${subject}`,
      html: `
        <h2>Support Request</h2>
        <p><strong>From:</strong> ${userEmail}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    })

    return NextResponse.json({ success: true, message: 'Message sent successfully' })
  } catch (error) {
    console.error('Support contact error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again or email us directly.' },
      { status: 500 }
    )
  }
}
