// app/blog/page.tsx — Blog index page
import Link from 'next/link'
import { ArrowRight, Tag, Clock } from 'lucide-react'

const blogPosts = [
  {
    slug: 'ai-content-going-viral',
    title: 'How AI-Rewritten Content Gets 5x More Engagement',
    excerpt:
      'We analyzed 10,000 posts. Here\'s what makes AI-optimized content consistently outperform manual captions.',
    date: 'February 2026',
    readTime: '6 min read',
    category: 'AI & Content',
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    slug: 'hook-formulas-that-work',
    title: '7 Hook Formulas That Stop the Scroll Every Time',
    excerpt:
      'The exact opening lines that turn casual scrollers into engaged followers — backed by data.',
    date: 'January 2026',
    readTime: '5 min read',
    category: 'Growth Tips',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    slug: 'multi-platform-strategy',
    title: 'The Multi-Platform Strategy Used by Top Creators',
    excerpt:
      'Why posting to one platform is leaving money on the table, and how to be everywhere without burnout.',
    date: 'January 2026',
    readTime: '7 min read',
    category: 'Strategy',
    gradient: 'from-emerald-500 to-teal-600',
  },
]

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <Link
            href="/"
            className="text-white/60 hover:text-white text-sm mb-6 inline-block transition-colors"
          >
            ← Back to GoViral
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Learn How to <span className="text-indigo-400">Go Viral</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Strategies, case studies, and insights to grow your audience faster.
          </p>
        </div>
      </div>

      {/* Posts grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Gradient header */}
              <div
                className={`h-44 bg-gradient-to-br ${post.gradient} flex items-end p-6`}
              >
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                  <Tag className="w-3 h-3" />
                  {post.category}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mb-2">
                  <span>{post.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
