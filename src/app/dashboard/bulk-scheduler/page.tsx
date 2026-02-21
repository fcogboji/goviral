import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import BulkScheduler from '@/components/BulkScheduler'

export default async function BulkSchedulerPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return <BulkScheduler />
} 