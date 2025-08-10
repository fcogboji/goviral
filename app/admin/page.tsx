import Link from 'next/link'

export default function AdminHomePage() {
  const links = [
    { href: '/admin/dashboard', label: 'Overview' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/posts', label: 'Posts' },
    { href: '/admin/billing', label: 'Billing' },
    { href: '/admin/plans', label: 'Plans' },
    { href: '/admin/payments', label: 'Payments' },
    { href: '/admin/webhooks', label: 'Webhooks' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin</h2>
        <p className="text-gray-600">Choose a section to manage.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border bg-white p-5 shadow-sm hover:shadow transition"
          >
            <div className="text-lg font-semibold text-gray-900">{l.label}</div>
            <div className="mt-1 text-sm text-gray-600">{l.href}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}