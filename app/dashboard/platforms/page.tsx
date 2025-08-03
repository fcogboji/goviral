import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import PlatformIntegrations from '@/components/PlatformIntegrations'

export default async function PlatformsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return <PlatformIntegrations />
} 