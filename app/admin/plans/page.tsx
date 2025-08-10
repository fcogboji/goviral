import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { price: 'asc' },
    include: {
      subscriptions: true,
      payments: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Plans</h2>
        <p className="text-gray-600">Manage subscription plans and see usage.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <span className="text-xl font-bold">${plan.price.toFixed(2)}</span>
            </div>
            {plan.description && (
              <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
            )}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700">Features</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {plan.features.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-gray-50 p-3">
                <div className="text-gray-500">Subscriptions</div>
                <div className="text-gray-900 font-semibold">{plan.subscriptions.length}</div>
              </div>
              <div className="rounded-md bg-gray-50 p-3">
                <div className="text-gray-500">Payments</div>
                <div className="text-gray-900 font-semibold">{plan.payments.length}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}