/**
 * Script to list all users in the database
 * Usage: npx tsx scripts/list-users.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('📋 Fetching all users from database...\n');

    const users = await prisma.user.findMany({
      include: {
        subscription: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${users.length} total users\n`);

    if (users.length === 0) {
      console.log('❌ No users found in database.');
      console.log('💡 Tip: Users are created via Clerk webhook when they sign up.\n');
      return;
    }

    // Group by role
    const byRole = {
      admin: users.filter(u => u.role === 'admin'),
      premium: users.filter(u => u.role === 'premium'),
      free: users.filter(u => u.role === 'free')
    };

    console.log('📊 Users by Role:');
    console.log(`   Admin: ${byRole.admin.length}`);
    console.log(`   Premium: ${byRole.premium.length}`);
    console.log(`   Free: ${byRole.free.length}\n`);

    console.log('👥 User Details:\n');
    console.log('─'.repeat(100));

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email || 'No email'}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Clerk ID: ${user.clerkId}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);

      if (user.subscription) {
        console.log(`   Subscription:`);
        console.log(`     - Plan: ${user.subscription.planType}`);
        console.log(`     - Status: ${user.subscription.status}`);
        console.log(`     - Period: ${user.subscription.currentPeriodStart.toISOString()} to ${user.subscription.currentPeriodEnd.toISOString()}`);
        if (user.subscription.trialEndsAt) {
          console.log(`     - Trial Ends: ${user.subscription.trialEndsAt.toISOString()}`);
        }
        if (user.subscription.cardLast4) {
          console.log(`     - Card: **** **** **** ${user.subscription.cardLast4} (${user.subscription.cardBrand})`);
        }
      } else {
        console.log(`   Subscription: None`);
      }

      console.log('─'.repeat(100));
    });

  } catch (error) {
    console.error('❌ Error listing users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
listUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
