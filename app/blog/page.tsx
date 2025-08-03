// app/blog/page.tsx
export default function Blog() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">GoViral Blog</h1>
          <p className="text-xl mb-12 text-white/80 text-center">
            Latest insights on social media marketing and growth
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Blog post cards would go here */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <div className="h-48 bg-white/20 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Blog Post Title</h3>
              <p className="text-white/80 text-sm mb-4">
                This is a sample blog post description that would normally contain a preview of the article content.
              </p>
              <a href="#" className="text-white hover:underline font-medium">
                Read More →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}