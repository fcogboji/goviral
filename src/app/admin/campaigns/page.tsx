import {prisma} from "@/lib/prisma";
import { CampaignStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, role: true } },
      _count: { select: { posts: true } },
    },
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "ACTIVE").length,
    draft: campaigns.filter((c) => c.status === "DRAFT").length,
    completed: campaigns.filter((c) => c.status === "COMPLETED").length,
  };

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Campaign Management
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Campaigns</h3>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active</h3>
          <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Draft</h3>
          <p className="text-2xl font-semibold text-gray-600">{stats.draft}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-2xl font-semibold text-blue-600">
            {stats.completed}
          </p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platforms
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {campaign.name}
                  </div>
                  {campaign.description && (
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {campaign.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {campaign.user.email}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {campaign.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {campaign._count.posts}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {campaign.budget ? `₦${campaign.budget.toLocaleString()}` : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(campaign.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
