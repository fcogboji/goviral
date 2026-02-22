import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy | GoViral',
  description: 'GoViral Cookie Policy - How we use cookies and similar technologies.',
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: {new Date().toLocaleDateString('en-US')}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help sites remember your preferences, keep you signed in, and understand how you use the service. We use cookies and similar technologies (e.g., localStorage) to provide and improve GoViral.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Essential Cookies</h3>
                <p>Required for the Service to function. They enable authentication, security, and core features. These cannot be disabled without affecting functionality.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Preferences Cookies</h3>
                <p>Remember your settings (e.g., theme, language) and choices such as cookie consent. They improve your experience.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                <p>Help us understand how visitors use GoViral so we can improve the product. Data is aggregated and anonymized where possible.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Marketing Cookies</h3>
                <p>Used to deliver relevant ads and measure campaign effectiveness. These are optional and controlled via our cookie consent banner.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Third-Party Cookies</h2>
            <p>
              We use trusted partners who may set their own cookies: authentication (Clerk), payments (Stripe, Paystack), social platform integrations (Ayrshare), and analytics. Each has their own privacy policies governing their use of cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Managing Your Preferences</h2>
            <p>
              When you first visit GoViral, you will see a cookie consent banner. You can accept all cookies, reject non-essential ones, or customize your choices. Your preferences are stored and respected on future visits. You can change your mind at any time by clearing cookies or revisiting our site to trigger the banner again.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Browser Controls</h2>
            <p>
              Most browsers let you block or delete cookies via settings. Blocking essential cookies may prevent you from using certain features. For more information, see your browser&apos;s help section.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Updates</h2>
            <p>
              We may update this Cookie Policy from time to time. The &quot;Last updated&quot; date at the top reflects the latest version. Continued use of the Service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact</h2>
            <p>
              For questions about our use of cookies, contact us via our <Link href="/support" className="text-indigo-600 hover:underline">Support page</Link>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-6">
          <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Privacy Policy</Link>
          <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}
