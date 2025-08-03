"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Image, 
  Users, 
  Settings, 
  CreditCard, 
  Bell,
  ChevronLeft,
  ChevronRight,
  Plus,
  Target,
  Zap
} from 'lucide-react'

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const sidebarItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Campaigns',
      href: '/campaigns',
      icon: Target
    },
    {
      name: 'Schedule',
      href: '/schedule',
      icon: Calendar
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3
    },
    {
      name: 'Content Library',
      href: '/content',
      icon: Image
    },
    {
      name: 'AI Assistant',
      href: '/ai-assistant',
      icon: Zap
    },
    {
      name: 'Audience',
      href: '/audience',
      icon: Users
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell
    },
    {
      name: 'Billing',
      href: '/billing',
      icon: CreditCard
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ]

  return (
    <div className={`bg-white border-r border-gray-200 h-screen sticky top-0 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GV</span>
            </div>
            <span className="text-xl font-bold text-gray-900">GoViral</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <Link 
            href="/campaign/create"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade Banner */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
            <h3 className="font-semibold text-sm mb-1">Upgrade to Pro</h3>
            <p className="text-xs text-blue-100 mb-3">
              Get unlimited campaigns and advanced analytics
            </p>
            <Link 
              href="/pricing"
              className="w-full bg-white text-blue-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors text-center block"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}