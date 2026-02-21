import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (dbUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get comprehensive stats
    const [
      totalUsers,
      totalPosts,
      totalCampaigns,
      activeUsers,
      premiumUsers,
      totalRevenue,
      recentSignups,
      postsByStatus,
      userGrowth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.campaign.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.user.count({ where: { role: "premium" } }),
      prisma.payment.aggregate({
        where: { status: "success" },
        _sum: { amount: true },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.post.groupBy({
        by: ["status"],
        _count: true,
      }),
      // Get user growth data for last 30 days
      Promise.all(
        Array.from({ length: 30 }, async (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          date.setHours(0, 0, 0, 0);

          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          const count = await prisma.user.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDate,
              },
            },
          });

          return {
            date: date.toISOString().split("T")[0],
            count,
          };
        })
      ),
    ]);

    return NextResponse.json({
      overview: {
        totalUsers,
        totalPosts,
        totalCampaigns,
        activeUsers,
        premiumUsers,
        totalRevenue: totalRevenue._sum.amount || 0,
        recentSignups,
      },
      postsByStatus,
      userGrowth,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
