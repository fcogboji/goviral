// /app/(admin)/billing/page.tsx
import {prisma} from "@/lib/prisma";

// Define the type for the user object
type PremiumUser = {
  id: string;
  email: string;
  createdAt: Date;
};

export default async function BillingPage() {
  const billingStats = await Promise.all([
    prisma.user.count({ where: { role: "premium" } }),
    prisma.user.count({ where: { role: "free" } }),
    // Add more billing-related queries as needed
  ]);

  const [premiumUsers, freeUsers] = billingStats;

  const premiumUsersList = await prisma.user.findMany({
    where: { role: "premium" },
    select: {
      id: true,
      email: true,
      createdAt: true,
      // Add subscription fields if you have them
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing & Subscriptions</h1>
      
      {/* Billing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Premium Users</h3>
          <p className="text-2xl font-semibold text-green-600">{premiumUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Free Users</h3>
          <p className="text-2xl font-semibold text-gray-600">{freeUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          <p className="text-2xl font-semibold text-blue-600">
            {((premiumUsers / (premiumUsers + freeUsers)) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Premium Users List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Premium Subscribers
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            List of all premium subscribers and their subscription details.
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {premiumUsersList.map((user: PremiumUser) => (
            <li key={user.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Subscribed: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Premium
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}