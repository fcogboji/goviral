import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminWebhooksPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 50,
    select: {
      id: true,
      reference: true,
      status: true,
      updatedAt: true,
      paystackData: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Webhooks</h2>
        <p className="text-gray-600">Recent Paystack webhook deliveries (from stored payment payloads).</p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Reference</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Updated</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Payload Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((p) => {
              const size = p.paystackData ? JSON.stringify(p.paystackData).length : 0
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono text-xs">{p.reference}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      p.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : p.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(p.updatedAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{size} bytes</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}