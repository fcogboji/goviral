"use client"

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Grid, 
  List,
  Edit,
  Trash2,
  Eye,
  Share2,
  Calendar
} from 'lucide-react'
import Image from 'next/image'

const contentItems = [
  {
    id: 1,
    title: 'Summer Collection Launch',
    type: 'Image',
    platform: 'Instagram',
    status: 'Published',
    engagement: 1250,
    views: 8500,
    date: '2024-01-15',
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    title: 'Product Demo Video',
    type: 'Video',
    platform: 'TikTok',
    status: 'Scheduled',
    engagement: 850,
    views: 12000,
    date: '2024-01-20',
    thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    title: 'Brand Story Campaign',
    type: 'Carousel',
    platform: 'Facebook',
    status: 'Draft',
    engagement: 0,
    views: 0,
    date: '2024-01-25',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  },
  {
    id: 4,
    title: 'Customer Testimonial',
    type: 'Video',
    platform: 'LinkedIn',
    status: 'Published',
    engagement: 450,
    views: 3200,
    date: '2024-01-12',
    thumbnail: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=300&fit=crop',
  },
  {
    id: 5,
    title: 'Holiday Special Offer',
    type: 'Image',
    platform: 'Twitter',
    status: 'Published',
    engagement: 680,
    views: 5400,
    date: '2024-01-10',
    thumbnail: 'https://images.unsplash.com/photo-1607083206325-caf1edba7a0f?w=400&h=300&fit=crop',
  },
  {
    id: 6,
    title: 'Behind the Scenes',
    type: 'Story',
    platform: 'Instagram',
    status: 'Expired',
    engagement: 320,
    views: 2800,
    date: '2024-01-08',
    thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop',
  },
]

export default function ContentLibrary() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || item.status.toLowerCase() === selectedFilter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const ContentCard = ({ item }: { item: typeof contentItems[0] }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative">
        <Image
          src={item.thumbnail}
          alt={item.title}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
            {item.status}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            {item.type}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{item.platform}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{item.views.toLocaleString()} views</span>
          <span>{item.engagement.toLocaleString()} engagements</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{item.date}</span>
          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-400 hover:text-blue-600" title="View content">
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-green-600" title="Edit content">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-purple-600" title="Share content">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-red-600" title="Delete content">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const ContentListItem = ({ item }: { item: typeof contentItems[0] }) => (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <Image
          src={item.thumbnail}
          alt={item.title}
          width={80}
          height={60}
          className="w-20 h-15 object-cover rounded"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{item.title}</h3>
          <p className="text-sm text-gray-600">{item.platform} • {item.type}</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">{item.views.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Views</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">{item.engagement.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Engagements</p>
          </div>
          <div className="text-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
              {item.status}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-900">{item.date}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-400 hover:text-blue-600" title="View content">
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-green-600" title="Edit content">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-purple-600" title="Share content">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-red-600" title="Delete content">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Content</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-4">
          {/* Filter */}
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContent.map((item) => (
            <ContentListItem key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first piece of content to get started'}
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Create Content
          </button>
        </div>
      )}
    </div>
  )
}