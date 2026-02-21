// app/dashboard/campaigns/[id]/page.tsx
import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

interface CampaignPageProps {
  params: Promise<{ id: string }>
}

async function getCampaign(campaignId: string, userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return null
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId: user.id
      },
      include: {
        posts: true
      }
    })

    return campaign
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return null
  }
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    return <div>Unauthorized</div>
  }

  const campaign = await getCampaign(id, userId)

  if (!campaign) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Campaign Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {campaign.title}
          </h1>
          <p className="text-gray-600 mb-4">
            {campaign.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Status: {campaign.status}</span>
            <span>Posts: {campaign.posts.length}</span>
            <span>Platforms: {campaign.platforms.join(', ')}</span>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Campaign Info</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Start Date:</span>{' '}
                {campaign.startDate 
                  ? formatDate(campaign.startDate)
                  : 'Not set'
                }
              </div>
              <div>
                <span className="font-medium">End Date:</span>{' '}
                {campaign.endDate 
                  ? formatDate(campaign.endDate)
                  : 'Not set'
                }
              </div>
              <div>
                <span className="font-medium">Budget:</span> ${campaign.budget || 0}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Performance</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Total Posts:</span> {campaign.posts.length}
              </div>
              <div>
                <span className="font-medium">Published:</span>{' '}
                {campaign.posts.filter(p => p.status === 'PUBLISHED').length}
              </div>
              <div>
                <span className="font-medium">Scheduled:</span>{' '}
                {campaign.posts.filter(p => p.status === 'SCHEDULED').length}
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Campaign Posts</h3>
          </div>
          <div className="divide-y">
            {campaign.posts.map((post) => (
              <div key={post.id} className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Post #{post.id.slice(-8)}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    post.status === 'PUBLISHED' 
                      ? 'bg-green-100 text-green-800'
                      : post.status === 'SCHEDULED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{post.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Platforms: {post.platforms.join(', ')}</span>
                  {post.scheduledFor && (
                    <span>
                      Scheduled: {new Date(post.scheduledFor).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}