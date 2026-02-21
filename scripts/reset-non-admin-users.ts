/**
 * Script to reset all non-admin users
 * This will cancel their subscriptions and trials, forcing them to start fresh
 * Usage: npx tsx scripts/reset-non-admin-users.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetNonAdminUsers() {
  try {
    console.log('🔍 Finding all non-admin users...\n');

    // Get all non-admin users
    const nonAdminUsers = await prisma.user.findMany({
      where: {
        role: { not: 'admin' }
      },
      include: {
        subscription: true
      }
    });

    console.log(`Found ${nonAdminUsers.length} non-admin users\n`);

    if (nonAdminUsers.length === 0) {
      console.log('✅ No non-admin users found. Nothing to reset.');
      return;
    }

    // Confirm before proceeding
    console.log('⚠️  WARNING: This will:');
    console.log('   - Cancel all active subscriptions');
    console.log('   - Remove trial periods');
    console.log('   - Delete saved card details');
    console.log('   - Reset users to FREE plan');
    console.log('   - Force users to enter card details for new trials/subscriptions\n');

    // In a real scenario, you might want to add confirmation
    // For now, we'll proceed automatically
    console.log('🚀 Proceeding with reset...\n');

    let resetCount = 0;
    let subscriptionDeletedCount = 0;

    for (const user of nonAdminUsers) {
      console.log(`Processing: ${user.email} (${user.name || 'No name'})`);

      // Delete the subscription completely to force fresh start
      if (user.subscription) {
        await prisma.subscription.delete({
          where: { userId: user.id }
        });
        console.log(`  ✓ Deleted subscription for ${user.email}`);
        subscriptionDeletedCount++;
      } else {
        console.log(`  - No subscription to delete for ${user.email}`);
      }

      // Reset user role to 'free' if it's 'premium'
      if (user.role === 'premium') {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'free' }
        });
        console.log(`  ✓ Reset role to 'free' for ${user.email}`);
      }

      resetCount++;
      console.log('');
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: null,
        action: 'RESET_NON_ADMIN_USERS',
        resource: 'users',
        details: {
          usersReset: resetCount,
          subscriptionsDeleted: subscriptionDeletedCount,
          timestamp: new Date().toISOString()
        },
        ipAddress: 'localhost',
        userAgent: 'reset-non-admin-users-script'
      }
    });

    console.log('✅ Reset complete!');
    console.log(`\nSummary:`);
    console.log(`  - Users reset: ${resetCount}`);
    console.log(`  - Subscriptions deleted: ${subscriptionDeletedCount}`);
    console.log('\n💡 All non-admin users must now:');
    console.log('   1. Start a new trial or subscription');
    console.log('   2. Enter their card details');
    console.log('   3. Complete payment verification\n');

  } catch (error) {
    console.error('❌ Error resetting users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetNonAdminUsers()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
