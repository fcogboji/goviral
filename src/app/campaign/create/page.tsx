import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import CampaignCreateForm from '@/components/CampaignCreateForm'

export default async function CreateCampaignPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
          <p className="text-gray-600 mt-2">Set up your social media marketing campaign</p>
        </div>
        <CampaignCreateForm />
      </div>
    </div>
  )
}