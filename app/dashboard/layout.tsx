import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { 
  Calendar, 
  BarChart3, 
  Users, 
  Settings, 
  Plus,
  Home,
  Video,
  Grid,
  Link as LinkIcon,
  Library,
  AppWindow
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Content Studio', href: '/dashboard/content-studio', icon: Video },
    { name: 'Bulk Scheduler', href: '/dashboard/bulk-scheduler', icon: Grid },
    { name: 'Schedule Posts', href: '/dashboard/schedule', icon: Calendar },
    { name: 'Content Library', href: '/dashboard/posts', icon: Library },
    { name: 'Platforms', href: '/dashboard/platforms', icon: LinkIcon },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Users },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
     { name: 'Connect', href: '/dashboard/connect', icon: AppWindow },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <Link href="./">
              <h1 className="text-xl font-bold text-gray-900">GoViral</h1>
            </Link>
           
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Link
              href="/dashboard/content-studio"
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Video className="w-4 h-4 mr-2" />
              Create Content
            </Link>
            <Link
              href="/dashboard/bulk-scheduler"
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Bulk Schedule
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}