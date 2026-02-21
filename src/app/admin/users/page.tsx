// /app/(admin)/users/page.tsx
import {prisma} from "@/lib/prisma";
import UserManagementClient from "@/components/admin/UserManagementClient";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
      _count: {
        select: {
          posts: true,
          notifications: true,
        },
      },
    },
  });

  // Transform users to include stats in the expected format
  const transformedUsers = await Promise.all(users.map(async (user) => {
    const platformsCount = await prisma.platformIntegration.count({
      where: { userId: user.id, isActive: true }
    });

    const sub = user.subscription;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      subscription: sub && sub.plan ? {
        id: sub.id,
        planType: sub.planType,
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
        trialEndsAt: sub.trialEndsAt ?? null,
        cardLast4: sub.cardLast4 ?? null,
        cardBrand: sub.cardBrand ?? null,
        plan: {
          name: sub.plan.name,
          price: sub.plan.price,
          currency: sub.plan.currency,
        }
      } : null,
      stats: {
        totalPosts: user._count.posts,
        connectedPlatforms: platformsCount,
      },
      _count: user._count,
    };
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <div className="text-sm text-gray-600">
          Total Users: <span className="font-semibold">{users.length}</span>
        </div>
      </div>

      <UserManagementClient initialUsers={transformedUsers} />
    </div>
  );
}
