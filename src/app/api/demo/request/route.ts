import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// POST - Submit a demo request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, preferredDate, preferredTime, message } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create demo request
    const demoRequest = await prisma.demoRequest.create({
      data: {
        name,
        email,
        phone,
        company,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime,
        message,
        status: 'pending',
      },
    });

    // Send notification email to admin
    if (resend && process.env.ADMIN_EMAIL) {
      try {
        await resend.emails.send({
          from: 'GoViral <noreply@yourdomain.com>',
          to: process.env.ADMIN_EMAIL,
          subject: 'New Demo Request',
          html: `
            <h2>New Demo Request</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
            ${preferredDate ? `<p><strong>Preferred Date:</strong> ${new Date(preferredDate).toLocaleDateString()}</p>` : ''}
            ${preferredTime ? `<p><strong>Preferred Time:</strong> ${preferredTime}</p>` : ''}
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          `,
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Send confirmation email to user
    if (resend) {
      try {
        await resend.emails.send({
          from: 'GoViral <noreply@yourdomain.com>',
          to: email,
          subject: 'Demo Request Received',
          html: `
            <h2>Thank you for your interest in GoViral!</h2>
            <p>Hi ${name},</p>
            <p>We've received your demo request and will get back to you shortly.</p>
            ${preferredDate ? `<p>We've noted your preferred date: ${new Date(preferredDate).toLocaleDateString()} ${preferredTime || ''}</p>` : ''}
            <p>In the meantime, feel free to explore our platform or start a free trial.</p>
            <br>
            <p>Best regards,<br>The GoViral Team</p>
          `,
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      demoRequest: {
        id: demoRequest.id,
        name: demoRequest.name,
        email: demoRequest.email,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating demo request:', error);
    return NextResponse.json(
      { error: 'Failed to submit demo request' },
      { status: 500 }
    );
  }
}

// GET - Fetch all demo requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const requests = await prisma.demoRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching demo requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demo requests' },
      { status: 500 }
    );
  }
}
