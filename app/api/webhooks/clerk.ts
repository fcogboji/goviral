import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the webhook for debugging
    console.log('Webhook received:', body.type, body.data?.id);
    
    const eventType = body.type;
    
    if (eventType === 'user.created') {
      const user = body.data;
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
      const user = body.data;
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
      const user = body.data;
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