// app/support/page.tsx
export default function Support() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">Support Center</h1>
          <p className="text-gray-600 mb-8">
            We&apos;re here to help! Contact our support team for assistance with your account, billing, or technical issues.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-4">Contact Support</h3>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <textarea
                  placeholder="Describe your issue..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button className="w-full bg-white text-purple-900 font-semibold py-3 px-6 rounded-lg hover:bg-white/90 transition-colors">
                  Send Message
                </button>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-4">Quick Help</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/10 rounded-lg">
                  <h4 className="font-semibold mb-2">Getting Started</h4>
                  <p className="text-white/80 text-sm">Learn the basics of using GoViral</p>
                </div>
                <div className="p-4 bg-white/10 rounded-lg">
                  <h4 className="font-semibold mb-2">Campaign Setup</h4>
                  <p className="text-white/80 text-sm">How to create your first campaign</p>
                </div>
                <div className="p-4 bg-white/10 rounded-lg">
                  <h4 className="font-semibold mb-2">Analytics</h4>
                  <p className="text-white/80 text-sm">Understanding your metrics</p>
                </div>
                <div className="p-4 bg-white/10 rounded-lg">
                  <h4 className="font-semibold mb-2">Billing</h4>
                  <p className="text-white/80 text-sm">Payment and subscription questions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}