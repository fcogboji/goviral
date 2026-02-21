import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Analytics from '@/components/Analytics'

export default async function AnalyticsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Analytics />
    </div>
  )
} 