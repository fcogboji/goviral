import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import CookieConsent from '@/components/CookieConsent'
import Script from "next/script";
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GoViral - Social Media Management',
  description: 'Schedule posts, track analytics, and manage campaigns across multiple platforms',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Script src="https://24-7concept-pew4inhis-friday-s-projects.vercel.app/api/embed" async data-bot-id="cmngeertx0005l7jxvn3pb70g" data-brand="goviral"></Script>
          <Toaster richColors position="top-right" closeButton />
          <CookieConsent />
        </body>
      </html>
    </ClerkProvider>
  )
}