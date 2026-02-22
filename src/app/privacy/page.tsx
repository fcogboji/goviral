import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | GoViral',
  description: 'GoViral Privacy Policy - How we collect, use, and protect your data.',
}

export default function PrivacyPage() {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: {new Date().toLocaleDateString('en-US')}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              GoViral (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our social media management platform and related services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="mb-4">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account information:</strong> Name, email address, and profile details when you create an account</li>
              <li><strong>Payment information:</strong> Billing details processed securely through our payment providers (Stripe, Paystack)</li>
              <li><strong>Social media data:</strong> Content you create, post, or schedule; connected account information; and analytics from linked platforms</li>
              <li><strong>Usage data:</strong> How you interact with our services, features used, and performance metrics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Provide, maintain, and improve our services</li>
              <li>Process payments and manage subscriptions</li>
              <li>Connect to and post content on your linked social media accounts</li>
              <li>Send transactional emails, support responses, and product updates</li>
              <li>Analyze usage to enhance user experience</li>
              <li>Comply with legal obligations and enforce our terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with service providers who assist our operations (e.g., hosting, payments, analytics). We require these partners to protect your data and use it only for the purposes we specify. We may disclose information when required by law or to protect our rights and safety.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including encryption in transit and at rest, access controls, and regular security assessments. Payment data is handled by PCI-compliant processors; we do not store full card numbers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p>
              Depending on your location, you may have rights to access, correct, delete, or restrict processing of your data. You can manage your account and export your data from the Settings page. Contact us at <a href="/support" className="text-indigo-600 hover:underline">support</a> for requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies as described in our <Link href="/cookies" className="text-indigo-600 hover:underline">Cookie Policy</Link>. You can manage your preferences through our cookie consent banner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contact</h2>
            <p>
              For privacy-related questions, contact us via our <Link href="/support" className="text-indigo-600 hover:underline">Support page</Link>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-6">
          <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Terms of Service</Link>
          <Link href="/cookies" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Cookie Policy</Link>
        </div>
      </div>
    </div>
  )
}
