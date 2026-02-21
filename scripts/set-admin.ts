// Script to set a user as admin
// Usage: npx tsx scripts/set-admin.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setAdmin() {
  // Get email from command line argument or use default
  const adminEmail = process.argv[2] || "friday.ogboji100@gmail.com";

  if (!process.argv[2]) {
    console.log(`⚠️  No email provided. Using default: ${adminEmail}`);
    console.log(`To use a different email, run: npm run set-admin <your-email>\n`);
  }

  try {
    // Find user by email
    let user = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!user) {
      console.log(`⚠️  User with email ${adminEmail} not found in database.`);
      console.log("Creating user record...");

      // Create user if doesn't exist (use temporary clerkId)
      user = await prisma.user.create({
        data: {
          clerkId: `temp_${Date.now()}`, // Temporary ID, will be updated by webhook
          email: adminEmail,
          role: "admin",
        },
      });

      console.log("✅ User created with admin role!");
      console.log(`Email: ${user.email}`);
      console.log(`User ID: ${user.id}`);
      console.log("\n⚠️  NOTE: This is a temporary record. Please sign in once to sync with Clerk.");

      return;
    }

    // Update user role to admin
    const updatedUser = await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "admin" },
    });

    console.log("✅ User successfully set as admin!");
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Role: ${updatedUser.role}`);
    console.log(`User ID: ${updatedUser.id}`);

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: updatedUser.id,
        action: "SET_ADMIN_ROLE",
        resource: "User",
        resourceId: updatedUser.id,
        details: { email: adminEmail, previousRole: user.role, newRole: "admin" },
        ipAddress: "localhost",
        userAgent: "set-admin-script",
      },
    });

    console.log("\n🎉 Admin access granted! You can now access /admin/dashboard");
  } catch (error) {
    console.error("❌ Error setting admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
