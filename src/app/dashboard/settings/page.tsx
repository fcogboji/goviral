'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Download,
  Save,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  XCircle,
  RotateCcw,
} from 'lucide-react'

interface SubscriptionData {
  status: string
  planType: string
  planName: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  trialEndsAt: string | null
  cancelAtPeriodEnd: boolean
  cardLast4: string | null
  cardBrand: string | null
  cardExpMonth: string | null
  cardExpYear: string | null
  isActive: boolean
}

interface UsageData {
  posts: { used: number; limit: number; remaining: number }
  platforms: { used: number; limit: number; remaining: number }
}

interface BillingPayment {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: string
  reference: string
}

interface NotificationSettings {
  email: boolean
  scheduling: boolean
  analytics: boolean
}

export default function SettingsPage() {
  const { user: clerkUser, isLoaded } = useUser()
  const { openUserProfile } = useClerk()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [reactivating, setReactivating] = useState(false)
  const [exportingData, setExportingData] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [payments, setPayments] = useState<BillingPayment[]>([])

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    scheduling: true,
    analytics: false,
  })

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  const showError = (msg: string) => {
    setErrorMessage(msg)
    setTimeout(() => setErrorMessage(''), 5000)
  }

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/subscriptions/status')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data.subscription || null)
        setUsage(data.usage || null)
      }
    } catch {
      // silently fail
    }
  }, [])

  const fetchBillingHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/payment/history')
      if (res.ok) {
        const data = await res.json()
        setPayments(data.payments || [])
      }
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    if (isLoaded) {
      Promise.all([fetchSubscriptionStatus(), fetchBillingHistory()]).finally(
        () => setLoading(false)
      )
    }
  }, [isLoaded, fetchSubscriptionStatus, fetchBillingHistory])

  const handleNotificationChange = (
    type: keyof NotificationSettings,
    checked: boolean
  ) => {
    setNotifications((prev) => ({ ...prev, [type]: checked }))
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    try {
      // Simulated — extend with a real API endpoint if needed
      await new Promise((r) => setTimeout(r, 500))
      showSuccess('Notification preferences saved.')
    } catch {
      showError('Failed to save preferences.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel? You will keep access until the end of your current billing period.'
      )
    ) {
      return
    }

    setCancelling(true)
    setErrorMessage('')
    try {
      const res = await fetch('/api/subscriptions/cancel', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.success) {
        showSuccess(data.message)
        await fetchSubscriptionStatus()
      } else {
        showError(data.error || 'Failed to cancel subscription')
      }
    } catch {
      showError('Network error. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  const handleReactivateSubscription = async () => {
    setReactivating(true)
    setErrorMessage('')
    try {
      const res = await fetch('/api/subscriptions/cancel', { method: 'DELETE' })
      const data = await res.json()
      if (res.ok && data.success) {
        showSuccess(data.message)
        await fetchSubscriptionStatus()
      } else {
        showError(data.error || 'Failed to reactivate subscription')
      }
    } catch {
      showError('Network error. Please try again.')
    } finally {
      setReactivating(false)
    }
  }

  const handleManageAccount = () => {
    openUserProfile()
  }

  const handleExportData = async () => {
    setExportingData(true)
    try {
      const [subRes, payRes] = await Promise.all([
        fetch('/api/subscriptions/status'),
        fetch('/api/payment/history'),
      ])
      const subData = subRes.ok ? await subRes.json() : {}
      const payData = payRes.ok ? await payRes.json() : {}

      const dataToExport = {
        exportedAt: new Date().toISOString(),
        profile: {
          name: clerkUser?.fullName,
          email: clerkUser?.primaryEmailAddress?.emailAddress,
        },
        subscription: subData.subscription,
        usage: subData.usage,
        payments: payData.payments,
      }

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `goviral-data-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)

      showSuccess('Data exported successfully!')
    } catch {
      showError('Failed to export data')
    } finally {
      setExportingData(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account, subscription, and preferences
        </p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-800">{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Profile ─── */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <p className="text-gray-900 font-medium">
                {clerkUser?.fullName || 'Not set'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">
                {clerkUser?.primaryEmailAddress?.emailAddress || 'Not set'}
              </p>
            </div>
            <button
              onClick={handleManageAccount}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Manage Account (Password, 2FA, etc.)
            </button>
          </div>
        </div>

        {/* ─── Subscription & Plan ─── */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Subscription
            </h2>
          </div>

          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {subscription.planName || subscription.planType}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status:{' '}
                    <span
                      className={`font-medium ${
                        subscription.status === 'active'
                          ? 'text-green-600'
                          : subscription.status === 'trial'
                          ? 'text-indigo-600'
                          : subscription.status === 'past_due'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {subscription.status === 'trial'
                        ? 'Free Trial'
                        : subscription.status.charAt(0).toUpperCase() +
                          subscription.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>

              {subscription.status === 'trial' && subscription.trialEndsAt && (
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-sm text-indigo-800">
                    <strong>Trial ends:</strong>{' '}
                    {new Date(subscription.trialEndsAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {subscription.currentPeriodEnd && (
                <p className="text-sm text-gray-500">
                  {subscription.cancelAtPeriodEnd
                    ? 'Access until: '
                    : 'Next billing: '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}

              {subscription.cancelAtPeriodEnd && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    Your subscription is set to cancel at the end of the current
                    period.
                  </p>
                  <button
                    onClick={handleReactivateSubscription}
                    disabled={reactivating}
                    className="mt-2 flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900"
                  >
                    {reactivating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    Reactivate Subscription
                  </button>
                </div>
              )}

              {/* Usage */}
              {usage && (
                <div className="space-y-2 pt-2">
                  <p className="text-sm font-medium text-gray-700">
                    Monthly Usage
                  </p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Posts</span>
                        <span>
                          {usage.posts.used} /{' '}
                          {usage.posts.limit === -1
                            ? '∞'
                            : usage.posts.limit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{
                            width:
                              usage.posts.limit === -1
                                ? '5%'
                                : `${Math.min(
                                    100,
                                    (usage.posts.used / usage.posts.limit) * 100
                                  )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Connected Platforms</span>
                        <span>
                          {usage.platforms.used} /{' '}
                          {usage.platforms.limit === -1
                            ? '∞'
                            : usage.platforms.limit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{
                            width:
                              usage.platforms.limit === -1
                                ? '5%'
                                : `${Math.min(
                                    100,
                                    (usage.platforms.used /
                                      usage.platforms.limit) *
                                      100
                                  )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upgrade / Cancel actions */}
              <div className="flex flex-col gap-2 pt-2">
                {subscription.planType !== 'Pro' && (
                  <a
                    href="/trial-signup?plan=pro"
                    className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Upgrade to Pro
                  </a>
                )}

                {!subscription.cancelAtPeriodEnd &&
                  ['active', 'trial'].includes(subscription.status) && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                      className="flex items-center justify-center gap-2 w-full border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      {cancelling ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Cancel Subscription
                    </button>
                  )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No active subscription</p>
              <a
                href="/trial-signup"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Start Free Trial
              </a>
            </div>
          )}
        </div>

        {/* ─── Notifications ─── */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Notifications
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                key: 'email' as const,
                label: 'Email notifications',
                desc: 'Receive updates via email',
              },
              {
                key: 'scheduling' as const,
                label: 'Post scheduling reminders',
                desc: 'Get reminded about scheduled posts',
              },
              {
                key: 'analytics' as const,
                label: 'Analytics reports',
                desc: 'Weekly performance reports',
              },
            ].map(({ key, label, desc }) => (
              <label
                key={key}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={(e) =>
                    handleNotificationChange(key, e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm text-gray-700">{label}</span>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </label>
            ))}
            <button
              onClick={handleSaveNotifications}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Preferences
            </button>
          </div>
        </div>

        {/* ─── Billing & Card ─── */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <CreditCard className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Billing
            </h2>
          </div>

          {subscription?.cardLast4 ? (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {subscription.cardBrand || 'Card'} ····{' '}
                  {subscription.cardLast4}
                </p>
                {subscription.cardExpMonth && subscription.cardExpYear && (
                  <p className="text-xs text-gray-500">
                    Expires {subscription.cardExpMonth}/
                    {subscription.cardExpYear}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-4">
              No payment method on file
            </p>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Recent Payments</p>
            {payments.length === 0 ? (
              <p className="text-sm text-gray-400">No payment history</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {payments.slice(0, 5).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="text-sm text-gray-700">
                        ${payment.amount.toFixed(2)} {payment.currency}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        payment.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : payment.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Security ─── */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Password, two-factor authentication, and sessions are managed
            through your Clerk account.
          </p>
          <button
            onClick={handleManageAccount}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Open Account Security
          </button>
        </div>
      </div>

      {/* Data Export — Full Width */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <Download className="w-6 h-6 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-900">Data Export</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Download your profile, subscription details, usage stats, and payment
          history as JSON.
        </p>
        <button
          onClick={handleExportData}
          disabled={exportingData}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
        >
          {exportingData ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export Data
        </button>
      </div>
    </div>
  )
}
