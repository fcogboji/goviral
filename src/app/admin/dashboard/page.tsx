// /app/(admin)/dashboard/page.tsx
import {prisma} from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboard() {
  const stats = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.notification.count({ where: { read: false } }),
    prisma.user.count({ where: { role: "premium" } }),
  ]);

  const [totalUsers, totalPosts, unreadNotifications, premiumUsers] = stats;

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const recentPosts = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-semibold text-gray-900">{totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Posts</h3>
          <p className="text-2xl font-semibold text-gray-900">{totalPosts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Unread Notifications</h3>
          <p className="text-2xl font-semibold text-gray-900">{unreadNotifications}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Premium Users</h3>
          <p className="text-2xl font-semibold text-gray-900">{premiumUsers}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(user.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Posts</h2>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="border-b pb-2">
                <p className="text-sm text-gray-900">{post.content.slice(0, 60)}...</p>
                <p className="text-xs text-gray-500">by {post.user.email}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(post.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}