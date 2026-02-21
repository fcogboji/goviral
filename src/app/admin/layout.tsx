// /app/(admin)/layout.tsx
import { currentUser } from "@clerk/nextjs/server";
import {prisma} from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  Megaphone,
  BarChart3,
  CreditCard,
  Settings,
  FileSearch,
  Crown,
  DollarSign,
  Network,
  Key,
  Video,
  Calendar
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Posts', href: '/admin/posts', icon: FileText },
  { name: 'Campaigns', href: '/admin/campaigns', icon: Megaphone },
  { name: 'Demo Requests', href: '/admin/demo-requests', icon: Calendar },
  { name: 'Demo Videos', href: '/admin/demo-videos', icon: Video },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'Transactions', href: '/admin/transactions', icon: DollarSign },
  { name: 'Plans', href: '/admin/plans', icon: Crown },
  { name: 'Platforms', href: '/admin/platforms', icon: Network },
  { name: 'API Keys', href: '/admin/api-keys', icon: Key },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileSearch },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  // Check admin: DB is source of truth (Clerk metadata synced when admin updates role)
  const role = dbUser?.role ?? (user.publicMetadata?.role as string);
  if (role !== "admin") {
    redirect("/"); // block non-admins
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">GoViral Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <span>←</span>
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {dbUser?.email}
              </div>
              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {dbUser?.email?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}