'use client'

import { useState, useEffect } from 'react'
import { 
  User,
  Bell,
  Shield,
  CreditCard,
  Download,
  Save,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface UserData {
  fullName: string
  emailAddresses: { emailAddress: string }[]
}

interface NotificationSettings {
  email: boolean;
  scheduling: boolean;
  analytics: boolean;
}

interface FormData {
  name: string;
  email: string;
  notifications: NotificationSettings;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exportingData, setExportingData] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    notifications: {
      email: true,
      scheduling: true,
      analytics: false
    }
  })

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // In a real app, you'd make an API call here
        // For now, we'll simulate loading user data
        const mockUser = {
          fullName: 'John Doe',
          emailAddresses: [{ emailAddress: 'john.doe@example.com' }]
        }
        
        setUser(mockUser)
        setFormData({
          name: mockUser.fullName || '',
          email: mockUser.emailAddresses[0]?.emailAddress || '',
          notifications: {
            email: true,
            scheduling: true,
            analytics: false
          }
        })
      } catch (error) {
        console.error('Failed to load user data:', error)
        setErrorMessage('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle notification changes
  const handleNotificationChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: checked
      }
    }))
  }

  // Save profile changes
  const handleSaveProfile = async () => {
    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, you'd make an API call here
      // await updateUserProfile(formData)
      
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setErrorMessage('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Security actions
  const handleChangePassword = () => {
    // Redirect to password change page or open modal
    alert('Redirecting to password change...')
  }

  const handleTwoFactorAuth = () => {
    // Open 2FA setup modal
    alert('Opening two-factor authentication setup...')
  }

  const handleConnectedDevices = () => {
    // Show connected devices modal
    alert('Showing connected devices...')
  }

  // Billing actions
  const handleManageSubscription = () => {
    // Redirect to subscription management
    alert('Redirecting to subscription management...')
  }

  const handlePaymentMethods = () => {
    // Show payment methods modal
    alert('Opening payment methods...')
  }

  const handleBillingHistory = () => {
    // Show billing history
    alert('Showing billing history...')
  }

  // Data export
  const handleExportData = async () => {
    setExportingData(true)
    setErrorMessage('')

    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, you'd generate and download the data
      const dataToExport = {
        profile: formData,
        posts: [],
        analytics: [],
        campaigns: []
      }
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'user-data-export.json'
      a.click()
      URL.revokeObjectURL(url)
      
      setSuccessMessage('Data exported successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to export data:', error)
      setErrorMessage('Failed to export data')
    } finally {
      setExportingData(false)
    }
  }

  if (loading) {
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
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{errorMessage}</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                readOnly
                title="Email address (read-only)"
                placeholder="email@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed from this page</p>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.notifications.email}
                onChange={(e) => handleNotificationChange('email', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
              />
              <div>
                <span className="text-sm text-gray-700">Email notifications</span>
                <p className="text-xs text-gray-500">Receive updates via email</p>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.notifications.scheduling}
                onChange={(e) => handleNotificationChange('scheduling', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
              />
              <div>
                <span className="text-sm text-gray-700">Post scheduling reminders</span>
                <p className="text-xs text-gray-500">Get reminded about scheduled posts</p>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.notifications.analytics}
                onChange={(e) => handleNotificationChange('analytics', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
              />
              <div>
                <span className="text-sm text-gray-700">Analytics reports</span>
                <p className="text-xs text-gray-500">Weekly performance reports</p>
              </div>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={handleChangePassword}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>Change password</span>
              <span className="text-gray-400">›</span>
            </button>
            
            <button 
              onClick={handleTwoFactorAuth}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>Two-factor authentication</span>
              <span className="text-gray-400">›</span>
            </button>
            
            <button 
              onClick={handleConnectedDevices}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>Connected devices</span>
              <span className="text-gray-400">›</span>
            </button>
          </div>
        </div>

        {/* Billing Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <CreditCard className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Billing</h2>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={handleManageSubscription}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>Manage subscription</span>
              <span className="text-gray-400">›</span>
            </button>
            
            <button 
              onClick={handlePaymentMethods}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>Payment methods</span>
              <span className="text-gray-400">›</span>
            </button>
            
            <button 
              onClick={handleBillingHistory}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>Billing history</span>
              <span className="text-gray-400">›</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Download className="w-6 h-6 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-900">Data Export</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Download your data including posts, analytics, and campaign information.
        </p>
        
        <button 
          onClick={handleExportData}
          disabled={exportingData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exportingData ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </>
          )}
        </button>
      </div>

      {/* Debug info - remove in production */}
      {user && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
          <strong>Debug:</strong> Loaded user: {user.fullName} ({user.emailAddresses[0]?.emailAddress})
        </div>
      )}
    </div>
  )
}