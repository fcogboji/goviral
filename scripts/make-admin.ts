/**
 * Script to grant admin role to a user
 * Usage: npx tsx scripts/make-admin.ts <email>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeUserAdmin(email: string) {
  try {
    console.log(`Looking for user with email: ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      console.log('\nTip: Make sure you\'ve signed up first and the email is correct.');
      process.exit(1);
    }

    console.log(`\nFound user:`);
    console.log(`  Name: ${user.name || 'N/A'}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Current role: ${user.role}`);

    if (user.role === 'admin') {
      console.log('\n✅ This user is already an admin!');
      process.exit(0);
    }

    // Update user to admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    });

    console.log(`\n✅ Successfully updated user to admin role!`);
    console.log(`  New role: ${updatedUser.role}`);
    console.log('\nYou can now access the Admin Panel from the user menu in the navbar.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('\nUsage: npx tsx scripts/make-admin.ts <email>');
  console.log('Example: npx tsx scripts/make-admin.ts user@example.com');
  process.exit(1);
}

makeUserAdmin(email);
