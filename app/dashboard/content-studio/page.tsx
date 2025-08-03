import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ContentStudio from '@/components/ContentStudio'

export default async function ContentStudioPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return <ContentStudio />
} 