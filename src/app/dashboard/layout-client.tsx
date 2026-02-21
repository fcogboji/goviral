'use client'

import { useState, useEffect, useCallback } from 'react'
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
  AppWindow,
  Menu,
  X,
  Bell,
  Sparkles,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SubscriptionInfo {
  planName: string
  status: 'active' | 'trial' | 'past_due'
  trialEndsAt: string | null
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

interface Notification {
  id: string
  message: string
  read: boolean
  createdAt: string
}

export default function DashboardLayoutClient({
  children,
  subscriptionInfo,
}: {
  children: React.ReactNode
  subscriptionInfo: SubscriptionInfo | null
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const pathname = usePathname()

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read', { method: 'POST' })
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {
      // silently fail
    }
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

  // Calculate trial days remaining
  const trialDaysLeft = subscriptionInfo?.status === 'trial' && subscriptionInfo.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(subscriptionInfo.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <Link href="/" className="ml-4">
            <h1 className="text-xl font-bold text-gray-900">GoViral</h1>
          </Link>
        </div>

        {/* Mobile notification bell */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Notifications Dropdown */}
      {showNotifications && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setShowNotifications(false)}
          />
          <div className="fixed top-16 right-4 z-50 w-80 max-h-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-72">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 10).map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3 border-b last:border-b-0 text-sm ${
                      notif.read ? 'bg-white' : 'bg-indigo-50'
                    }`}
                  >
                    <p className="text-gray-700">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo - Desktop */}
          <div className="hidden lg:flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/">
              <h1 className="text-xl font-bold text-gray-900">GoViral</h1>
            </Link>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Header Inside Sidebar */}
          <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/" onClick={() => setSidebarOpen(false)}>
              <h1 className="text-xl font-bold text-gray-900">GoViral</h1>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Subscription Banner */}
          {subscriptionInfo && (
            <div className="mx-3 mt-3">
              {subscriptionInfo.status === 'trial' && trialDaysLeft !== null && (
                <div className={`rounded-lg p-3 text-xs ${
                  trialDaysLeft <= 2
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-indigo-50 border border-indigo-200'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {trialDaysLeft <= 2 ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    <span className={`font-semibold ${
                      trialDaysLeft <= 2 ? 'text-amber-800' : 'text-indigo-800'
                    }`}>
                      {trialDaysLeft === 0
                        ? 'Trial ends today'
                        : `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left in trial`}
                    </span>
                  </div>
                  <p className={`${trialDaysLeft <= 2 ? 'text-amber-600' : 'text-indigo-600'}`}>
                    {subscriptionInfo.planName} plan
                    {subscriptionInfo.cancelAtPeriodEnd && ' · Cancelling'}
                  </p>
                </div>
              )}

              {subscriptionInfo.status === 'active' && (
                <div className="rounded-lg p-3 text-xs bg-green-50 border border-green-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-green-600" />
                    <span className="font-semibold text-green-800">
                      {subscriptionInfo.planName} Plan
                    </span>
                  </div>
                  <p className="text-green-600">
                    {subscriptionInfo.cancelAtPeriodEnd
                      ? `Cancels ${new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString()}`
                      : `Renews ${new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString()}`}
                  </p>
                </div>
              )}

              {subscriptionInfo.status === 'past_due' && (
                <Link href="/dashboard/settings" className="block">
                  <div className="rounded-lg p-3 text-xs bg-red-50 border border-red-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span className="font-semibold text-red-800">Payment Failed</span>
                    </div>
                    <p className="text-red-600">Please update your payment method</p>
                  </div>
                </Link>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
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
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Video className="w-4 h-4 mr-2" />
              Create Content
            </Link>
            <Link
              href="/dashboard/bulk-scheduler"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Bulk Schedule
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 lg:pt-0 lg:pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
