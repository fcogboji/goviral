import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | GoViral',
  description: 'GoViral Terms of Service - Terms and conditions for using our platform.',
}

export default function TermsPage() {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: {new Date().toLocaleDateString('en-US')}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using GoViral (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. We may update these terms; continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>
              GoViral provides a platform for managing social media content, scheduling posts across multiple platforms, and analyzing performance. We integrate with third-party social networks; your use is also subject to their respective terms and policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account and Eligibility</h2>
            <p>
              You must be at least 18 years old and capable of forming a binding contract. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate information and notify us of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Violate any law or third-party rights</li>
              <li>Post content that is defamatory, harmful, or infringing</li>
              <li>Circumvent platform security or usage limits</li>
              <li>Resell, sublicense, or commercially exploit the Service without permission</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
            </ul>
            <p className="mt-4">
              We may suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Payment and Subscriptions</h2>
            <p>
              Paid plans are billed according to the pricing displayed at signup. Subscriptions auto-renew unless cancelled before the renewal date. Refunds are handled per our refund policy. You authorize us to charge your payment method for applicable fees.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
            <p>
              GoViral and its content, features, and branding are owned by us. We grant you a limited, non-exclusive license to use the Service for its intended purpose. You retain ownership of content you create; you grant us a license to use, store, and display it as needed to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, GoViral is provided &quot;as is&quot; without warranties of any kind. We are not liable for indirect, incidental, or consequential damages, or for any loss of data or profits arising from your use of the Service. Our total liability is limited to the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Termination</h2>
            <p>
              You may cancel your account at any time. We may suspend or terminate your access for violation of these terms or for any other reason. Upon termination, your right to use the Service ceases; we may retain data as required by law or our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact</h2>
            <p>
              For questions about these terms, contact us via our <Link href="/support" className="text-indigo-600 hover:underline">Support page</Link>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-6">
          <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Privacy Policy</Link>
          <Link href="/cookies" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Cookie Policy</Link>
        </div>
      </div>
    </div>
  )
}
