import { NextRequest, NextResponse } from "next/server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getPlanConfig } from "@/lib/plans-db";
import { requireAdmin } from "@/lib/access-control";
import { validateRequest, adminUserUpdateSchema } from "@/lib/validations";

// Update user (role, status, subscription, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use consistent admin access control
    await requireAdmin(dbUser.id);

    const { id } = await params;
    const body = await req.json();

    // Validate request body
    const validation = validateRequest(adminUserUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    const { role, planType, subscriptionStatus, trialEndsAt, currentPeriodEnd, isBlocked, blockedReason } = validation.data;

    const updateData: {
      role?: string;
      isBlocked?: boolean;
      blockedAt?: Date | null;
      blockedReason?: string | null;
      blockedBy?: string | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (role) {
      updateData.role = role;
    }

    if (isBlocked !== undefined) {
      const targetUser = await prisma.user.findUnique({
        where: { id },
        select: { role: true },
      });
      if (targetUser?.role === "admin") {
        return NextResponse.json(
          { error: "Cannot block or unblock administrator accounts" },
          { status: 400 }
        );
      }
      updateData.isBlocked = isBlocked;
      updateData.blockedAt = isBlocked ? new Date() : null;
      updateData.blockedReason = isBlocked ? (blockedReason ?? "Blocked by administrator") : null;
      updateData.blockedBy = isBlocked ? dbUser.id : null;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        subscription: true,
      },
    });

    // Sync role to Clerk publicMetadata so admin layout and APIs stay consistent
    if (role !== undefined) {
      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(updatedUser.clerkId, {
          publicMetadata: { role },
        });
      } catch (clerkErr) {
        console.error("Failed to sync role to Clerk:", clerkErr);
        // Don't fail the request - DB is source of truth, Clerk will sync on next login
      }
    }

    // Handle subscription updates
    if (planType) {
      // User is being upgraded to a paid plan - check DB first, then plan-features
      let dbPlan = await prisma.plan.findFirst({
        where: { name: { equals: planType, mode: "insensitive" } },
      });

      if (!dbPlan) {
        const planConfig = await getPlanConfig(planType);
        if (!planConfig) {
          return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }
        dbPlan = await prisma.plan.create({
          data: {
            name: planConfig.name,
            price: planConfig.price,
            priceNGN: planConfig.priceNGN,
            priceGBP: planConfig.priceGBP,
            yearlyMonthlyPrice: planConfig.yearlyMonthlyPrice,
            yearlyMonthlyPriceNGN: planConfig.yearlyMonthlyPriceNGN,
            yearlyMonthlyPriceGBP: planConfig.yearlyMonthlyPriceGBP,
            currency: "USD",
            features: [...planConfig.features],
            maxPosts: planConfig.limits.maxPostsPerMonth,
            maxPlatforms: planConfig.limits.maxPlatforms,
            maxWhatsAppMessages: planConfig.limits.maxWhatsAppMessages ?? 0,
            trialDays: planConfig.trialDays,
            isActive: true,
          },
        });
      }

      const subscriptionUpdateData: {
        planType: string;
        status: string;
        planId: string;
        trialEndsAt?: Date | null;
        currentPeriodEnd?: Date;
        currentPeriodStart?: Date;
        updatedAt: Date;
      } = {
        planType: planType,
        planId: dbPlan.id,
        status: subscriptionStatus || "active",
        updatedAt: new Date(),
      };

      // Handle trial end date
      if (trialEndsAt) {
        subscriptionUpdateData.trialEndsAt = new Date(trialEndsAt);
      } else {
        subscriptionUpdateData.trialEndsAt = null;
      }

      // Handle billing period end date
      if (currentPeriodEnd) {
        subscriptionUpdateData.currentPeriodEnd = new Date(currentPeriodEnd);
      } else {
        // Default to 30 days from now
        subscriptionUpdateData.currentPeriodEnd = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        );
      }

      // Create or update subscription
      const createData: {
        userId: string;
        planId: string;
        planType: string;
        status: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        trialEndsAt?: Date | null;
      } = {
        userId: id,
        planId: dbPlan.id,
        planType: planType,
        status: subscriptionStatus || "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: subscriptionUpdateData.currentPeriodEnd,
      };

      if (subscriptionUpdateData.trialEndsAt !== undefined) {
        createData.trialEndsAt = subscriptionUpdateData.trialEndsAt;
      }

      await prisma.subscription.upsert({
        where: { userId: id },
        create: createData,
        update: subscriptionUpdateData,
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: id,
          message: `Your account has been updated by an administrator. Plan: ${planType}. Status: ${subscriptionStatus || "active"}.`,
          type: "in-app",
        },
      });
    } else if (subscriptionStatus === 'cancelled' || subscriptionStatus === 'inactive') {
      // Admin is deactivating — delete subscription
      await prisma.subscription.deleteMany({
        where: { userId: id },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: id,
          message: `Your subscription has been cancelled by an administrator.`,
          type: "in-app",
        },
      });
    } else if (subscriptionStatus || trialEndsAt !== undefined || currentPeriodEnd) {
      // Only status or dates are being updated (no plan change)
      const existingSub = await prisma.subscription.findUnique({
        where: { userId: id },
      });

      if (existingSub) {
        const subscriptionUpdateData: {
          status?: string;
          trialEndsAt?: Date | null;
          currentPeriodEnd?: Date;
          updatedAt: Date;
        } = {
          updatedAt: new Date(),
        };

        if (subscriptionStatus) {
          subscriptionUpdateData.status = subscriptionStatus;
        }

        if (trialEndsAt !== undefined) {
          subscriptionUpdateData.trialEndsAt = trialEndsAt ? new Date(trialEndsAt) : null;
        }

        if (currentPeriodEnd) {
          subscriptionUpdateData.currentPeriodEnd = new Date(currentPeriodEnd);
        }

        await prisma.subscription.update({
          where: { userId: id },
          data: subscriptionUpdateData,
        });

        // Create notification
        await prisma.notification.create({
          data: {
            userId: id,
            message: `Your subscription has been updated by an administrator.`,
            type: "in-app",
          },
        });
      }
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: dbUser.id,
        action: "UPDATE_USER",
        resource: "User",
        resourceId: id,
        details: { role, planType, subscriptionStatus, isBlocked, blockedReason },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use consistent admin access control
    await requireAdmin(dbUser.id);

    const { id } = await params;

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: dbUser.id,
        action: "DELETE_USER",
        resource: "User",
        resourceId: id,
        details: {},
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
