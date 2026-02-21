/**
 * Sync Clerk Users to Database
 *
 * This script fetches all users from Clerk and creates corresponding
 * records in your Prisma database. Run this once to sync existing users.
 *
 * Usage: npx tsx scripts/sync-clerk-users.ts
 */

import { createClerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function syncClerkUsers() {
  try {
    console.log('🔄 Starting Clerk user sync...\n');

    // Check for Clerk secret key
    if (!process.env.CLERK_SECRET_KEY) {
      console.error('❌ CLERK_SECRET_KEY not found in environment variables');
      console.error('   Make sure .env.local has CLERK_SECRET_KEY set');
      process.exit(1);
    }

    // Create Clerk client
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    // Fetch all users from Clerk
    const clerkUsers = await clerk.users.getUserList({ limit: 500 });

    console.log(`📊 Found ${clerkUsers.data.length} users in Clerk\n`);

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const clerkUser of clerkUsers.data) {
      try {
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';

        if (!email) {
          console.log(`⚠️  Skipping user ${clerkUser.id} - no email address`);
          errors++;
          continue;
        }

        const result = await prisma.user.upsert({
          where: { clerkId: clerkUser.id },
          update: {
            email,
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
            imageUrl: clerkUser.imageUrl || null,
          },
          create: {
            clerkId: clerkUser.id,
            email,
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
            imageUrl: clerkUser.imageUrl || null,
            role: 'free', // Default role
          },
        });

        const wasCreated = result.createdAt.getTime() === result.updatedAt.getTime();
        if (wasCreated) {
          created++;
          console.log(`✅ Created user: ${email}`);
        } else {
          updated++;
          console.log(`🔄 Updated user: ${email}`);
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error processing user ${clerkUser.id}:`, error);
      }
    }

    console.log('\n📈 Sync Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total: ${clerkUsers.data.length}`);

  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

syncClerkUsers();
