import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      plan: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
        <p className="text-gray-600">Recent transactions via Paystack.</p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Reference</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-mono text-xs">{p.reference}</td>
                <td className="px-4 py-3">{p.plan?.name || '—'}</td>
                <td className="px-4 py-3">${p.amount.toFixed(2)}</td>
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
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}