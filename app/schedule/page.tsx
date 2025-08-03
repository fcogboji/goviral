import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ScheduleManager from '@/components/ScheduleManager'

export default async function SchedulePage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ScheduleManager />
    </div>
  )
}