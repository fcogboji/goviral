import {prisma} from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function PlatformsPage() {
  const platformIntegrations = await prisma.platformIntegration.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
  });

  // Group by platform
  const platformStats = platformIntegrations.reduce((acc, integration) => {
    if (!acc[integration.platform]) {
      acc[integration.platform] = {
        total: 0,
        active: 0,
        inactive: 0,
      };
    }
    acc[integration.platform].total++;
    if (integration.isActive) {
      acc[integration.platform].active++;
    } else {
      acc[integration.platform].inactive++;
    }
    return acc;
  }, {} as Record<string, { total: number; active: number; inactive: number }>);

  const platforms = [
    "facebook",
    "twitter",
    "instagram",
    "linkedin",
    "youtube",
    "tiktok",
    "whatsapp",
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Platform Integrations
      </h1>

      {/* Platform Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {platforms.map((platform) => {
          const stats = platformStats[platform] || { total: 0, active: 0, inactive: 0 };
          return (
            <div key={platform} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 capitalize mb-2">
                {platform}
              </h3>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="text-green-600">
                  {stats.active} active
                </span>
                <span className="text-gray-500">
                  {stats.inactive} inactive
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integrations Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            All Integrations
          </h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Connected
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {platformIntegrations.map((integration) => (
              <tr key={integration.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                    {integration.platform}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {integration.accountName}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {integration.platformUserId.slice(0, 20)}...
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {integration.user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      integration.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {integration.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(integration.connectedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {platformIntegrations.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No platform integrations yet</p>
        </div>
      )}
    </div>
  );
}
