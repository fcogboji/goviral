import {prisma} from "@/lib/prisma";
import { FileSearch } from "lucide-react";

export default async function AuditLogsPage() {
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100, // Limit to last 100 logs
  });

  const getActionColor = (action: string) => {
    if (action.includes("DELETE")) return "text-red-600 bg-red-50";
    if (action.includes("UPDATE")) return "text-yellow-600 bg-yellow-50";
    if (action.includes("CREATE")) return "text-green-600 bg-green-50";
    return "text-blue-600 bg-blue-50";
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Audit Logs</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing the last 100 audit log entries
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {log.resource}
                    </div>
                    {log.resourceId && (
                      <div className="text-xs text-gray-500">
                        ID: {log.resourceId.slice(0, 12)}...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.userId ? (
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {log.userId.slice(0, 12)}...
                      </code>
                    ) : (
                      <span className="text-gray-400">System</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ipAddress || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    {log.details ? (
                      <details className="cursor-pointer">
                        <summary className="text-blue-600 hover:text-blue-800">
                          View details
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-gray-400">No details</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {auditLogs.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No audit logs yet</p>
        </div>
      )}
    </div>
  );
}
