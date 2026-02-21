import {prisma} from "@/lib/prisma";
import { Users, FileText, Megaphone, TrendingUp } from "lucide-react";

export default async function AnalyticsPage() {
  // Get comprehensive analytics data
  const [
    totalUsers,
    totalPosts,
    totalCampaigns,
    premiumUsers,
    activeUsers,
    totalRevenue,
    postsByStatus,
    userGrowth,
    platformUsage,
    topUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.campaign.count(),
    prisma.user.count({ where: { role: "premium" } }),
    prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.payment.aggregate({
      where: { status: "success" },
      _sum: { amount: true },
    }),
    prisma.post.groupBy({
      by: ["status"],
      _count: true,
    }),
    // Last 7 days user signups
    Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
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
          date: date.toLocaleDateString("en-US", { weekday: "short" }),
          count,
        };
      })
    ),
    // Platform usage
    prisma.socialAccount.groupBy({
      by: ["platform"],
      _count: true,
    }),
    // Top users by posts
    prisma.user.findMany({
      take: 5,
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
      select: {
        email: true,
        role: true,
        _count: {
          select: { posts: true },
        },
      },
    }),
  ]);

  const conversionRate = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Analytics & Reports
      </h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {totalUsers}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {activeUsers} active (7d)
              </p>
            </div>
            <Users className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Posts</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {totalPosts}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {(totalPosts / (totalUsers || 1)).toFixed(1)} per user
              </p>
            </div>
            <FileText className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Campaigns</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {totalCampaigns}
              </p>
              <p className="text-sm text-gray-500 mt-1">Total active campaigns</p>
            </div>
            <Megaphone className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                ₦{((totalRevenue._sum.amount || 0) / 1).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {conversionRate.toFixed(1)}% conversion
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            User Signups (Last 7 Days)
          </h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {userGrowth.map((day, index) => {
              const maxCount = Math.max(...userGrowth.map((d) => d.count), 1);
              const height = (day.count / maxCount) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group"
                    style={{ height: `${height}%`, minHeight: "20px" }}
                  >
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100">
                      {day.count}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{day.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Posts by Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Posts by Status
          </h2>
          <div className="space-y-4">
            {postsByStatus.map((status) => {
              const percentage = (status._count / totalPosts) * 100;
              return (
                <div key={status.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">
                      {status.status}
                    </span>
                    <span className="text-gray-500">
                      {status._count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status.status === "PUBLISHED"
                          ? "bg-green-500"
                          : status.status === "SCHEDULED"
                          ? "bg-yellow-500"
                          : status.status === "FAILED"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Usage */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Platform Connections
          </h2>
          <div className="space-y-3">
            {platformUsage.map((platform) => (
              <div
                key={platform.platform}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {platform.platform}
                </span>
                <span className="text-sm text-gray-900 font-semibold">
                  {platform._count}
                </span>
              </div>
            ))}
            {platformUsage.length === 0 && (
              <p className="text-sm text-gray-500">No platform connections yet</p>
            )}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Users by Posts
          </h2>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div key={user.email} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-blue-600">
                  {user._count.posts} posts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
