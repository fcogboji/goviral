// app/demo/page.tsx
export default function Demo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Product Demo</h1>
          <p className="text-xl mb-8 text-white/80">
            See how GoViral can transform your social media presence
          </p>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-white/80">Demo video would be embedded here</p>
            </div>
          </div>
          <div className="mt-8">
            <button className="bg-white text-purple-900 font-semibold py-3 px-8 rounded-lg hover:bg-white/90 transition-colors mr-4">
              Start Free Trial
            </button>
            <button className="border border-white/30 text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors">
              Schedule Live Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}