import {prisma} from "@/lib/prisma";
import { Key, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ApiKeysPage() {
  const apiKeys = await prisma.apiKey.findMany({
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

  const stats = {
    total: apiKeys.length,
    active: apiKeys.filter((k) => k.isActive).length,
    inactive: apiKeys.filter((k) => !k.isActive).length,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">API Keys Management</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Keys</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {stats.total}
              </p>
            </div>
            <Key className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Keys</h3>
          <p className="text-2xl font-semibold text-green-600 mt-2">
            {stats.active}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Inactive Keys</h3>
          <p className="text-2xl font-semibold text-red-600 mt-2">
            {stats.inactive}
          </p>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Used
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {apiKeys.map((apiKey) => (
              <tr key={apiKey.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {apiKey.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {apiKey.user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    {apiKey.key.slice(0, 20)}...
                  </code>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {apiKey.permissions.length > 0 ? (
                      apiKey.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {perm}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No permissions</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {apiKey.isActive ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          Active
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600 font-medium">
                          Inactive
                        </span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {apiKey.lastUsed
                    ? formatDate(apiKey.lastUsed)
                    : "Never"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {apiKey.expiresAt ? (
                    <span
                      className={
                        new Date(apiKey.expiresAt) < new Date()
                          ? "text-red-600 font-medium"
                          : ""
                      }
                    >
                      {formatDate(apiKey.expiresAt)}
                    </span>
                  ) : (
                    "Never"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {apiKeys.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No API keys created yet</p>
        </div>
      )}
    </div>
  );
}
