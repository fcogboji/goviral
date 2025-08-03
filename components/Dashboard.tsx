"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Plus,
  Settings,
  Bell,
  Search,
  Filter,
  Heart,
  MoreHorizontal,
  type LucideIcon
} from 'lucide-react'

// Type definitions
interface Campaign {
  id: number;
  title: string;
  platform: string;
  status: 'active' | 'scheduled' | 'completed';
  reach: number;
  engagement: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
}

interface Analytics {
  totalCampaigns: number;
  totalReach: number;
  totalEngagement: number;
  totalRevenue: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change: number;
}

interface CampaignCardProps {
  campaign: Campaign;
}

type TabId = 'overview' | 'campaigns' | 'analytics' | 'billing';

export default function Dashboard() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [analytics] = useState<Analytics>({
    totalCampaigns: 12,
    totalReach: 450000,
    totalEngagement: 28000,
    totalRevenue: 15600
  })

  // Mock data for campaigns
  useEffect(() => {
    setCampaigns([
      {
        id: 1,
        title: 'Summer Fashion Campaign',
        platform: 'Instagram',
        status: 'active',
        reach: 125000,
        engagement: 8500,
        budget: 5000,
        spent: 3200,
        startDate: '2024-06-01',
        endDate: '2024-06-30'
      },
      {
        id: 2,
        title: 'Tech Product Launch',
        platform: 'Twitter',
        status: 'scheduled',
        reach: 0,
        engagement: 0,
        budget: 8000,
        spent: 0,
        startDate: '2024-07-15',
        endDate: '2024-08-15'
      },
      {
        id: 3,
        title: 'Holiday Special',
        platform: 'Facebook',
        status: 'completed',
        reach: 200000,
        engagement: 15000,
        budget: 3000,
        spent: 2800,
        startDate: '2024-05-01',
        endDate: '2024-05-31'
      }
    ])
  }, [])

  const StatCard = ({ title, value, icon: Icon, change }: StatCardProps) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-green-600 mt-1">+{change}% from last month</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  )

  const CampaignCard = ({ campaign }: CampaignCardProps) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{campaign.title}</h3>
          <p className="text-sm text-gray-600">{campaign.platform}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
            campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {campaign.status}
          </span>
          <button className="text-gray-400 hover:text-gray-600" title="More options">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Reach</p>
          <p className="font-semibold">{campaign.reach.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Engagement</p>
          <p className="font-semibold">{campaign.engagement.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Budget Used</span>
          <span>${campaign.spent} / ${campaign.budget}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {campaign.startDate} - {campaign.endDate}
        </div>
        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
          View Details
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600" title="Notifications">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600" title="Settings">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.firstName?.[0] || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview' as TabId, label: 'Overview' },
              { id: 'campaigns' as TabId, label: 'Campaigns' },
              { id: 'analytics' as TabId, label: 'Analytics' },
              { id: 'billing' as TabId, label: 'Billing' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Campaigns"
                value={analytics.totalCampaigns}
                icon={BarChart3}
                change={12}
              />
              <StatCard
                title="Total Reach"
                value={analytics.totalReach.toLocaleString()}
                icon={Users}
                change={24}
              />
              <StatCard
                title="Total Engagement"
                value={analytics.totalEngagement.toLocaleString()}
                icon={Heart}
                change={18}
              />
              <StatCard
                title="Total Revenue"
                value={`$${analytics.totalRevenue.toLocaleString()}`}
                icon={TrendingUp}
                change={32}
              />
            </div>

            {/* Recent Campaigns */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Campaign
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">All Campaigns</h2>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Campaign
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Platform
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reach
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                            <div className="text-sm text-gray-500">{campaign.startDate} - {campaign.endDate}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campaign.platform}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campaign.reach.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${campaign.spent} / ${campaign.budget}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-700 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-700">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Analytics Overview</h2>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-600">Detailed analytics charts and insights will be displayed here.</p>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Billing & Subscription</h2>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-600">Billing information and subscription details will be displayed here.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}