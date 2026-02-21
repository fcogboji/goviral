import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  // Get webhook secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('❌ CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // Check if headers exist
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Missing Svix headers');
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create new Svix instance with secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('❌ Webhook verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }

  try {
    // Log the webhook for debugging
    console.log('✅ Webhook verified:', evt.type, evt.data?.id);

    const eventType = evt.type;
    
    if (eventType === 'user.created') {
      const user = evt.data;
      console.log('Creating user:', user.id);
      
      // Create user in DB if not exists
      await prisma.user.upsert({
        where: { clerkId: user.id },
        update: {
          email: user.email_addresses?.[0]?.email_address || '',
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          imageUrl: user.image_url || ''
        },
        create: {
          clerkId: user.id,
          email: user.email_addresses?.[0]?.email_address || '',
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          imageUrl: user.image_url || ''
        }
      });
      
      console.log('✅ User created/updated successfully:', user.id);
    }
    
    if (eventType === 'user.updated') {
      const user = evt.data;
      console.log('Updating user:', user.id);
      
      try {
        await prisma.user.update({
          where: { clerkId: user.id },
          data: {
            email: user.email_addresses?.[0]?.email_address || '',
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            imageUrl: user.image_url || ''
          }
        });
        console.log('✅ User updated successfully:', user.id);
      } catch (updateError) {
        console.error('User update failed (user might not exist):', updateError);
      }
    }
    
    if (eventType === 'user.deleted') {
      const user = evt.data;
      console.log('Deleting user:', user.id);
      
      try {
        await prisma.user.delete({
          where: { clerkId: user.id }
        });
        console.log('✅ User deleted successfully:', user.id);
      } catch (deleteError) {
        console.error('User deletion failed (user might not exist):', deleteError);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}