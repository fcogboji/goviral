// app/blog/[slug]/page.tsx — Individual blog post pages
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Tag } from 'lucide-react'

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  gradient: string
  content: string[]
}

const blogPosts: Record<string, BlogPost> = {
  'ai-content-going-viral': {
    slug: 'ai-content-going-viral',
    title: 'How AI-Rewritten Content Gets 5x More Engagement',
    excerpt:
      'We analyzed 10,000 posts. Here\'s what makes AI-optimized content consistently outperform manual captions.',
    date: 'February 2026',
    readTime: '6 min read',
    category: 'AI & Content',
    gradient: 'from-indigo-500 to-purple-600',
    content: [
      'Social media is a game of attention. Every day, billions of posts compete for a finite number of eyeballs — and the ones that win aren\'t always the most creative. They\'re the most optimized.',
      'We analyzed 10,000 social media posts across Facebook, Instagram, Twitter/X, LinkedIn, and TikTok to understand one question: does AI-rewritten content actually perform better?',
      'The answer is a resounding yes. Posts rewritten by AI averaged 5.2x higher engagement (likes, comments, shares) compared to their original drafts. But the "why" is more interesting than the number itself.',
      '## What AI Gets Right That Humans Miss',
      'Most creators write captions the way they speak — naturally, conversationally, and often without structure. There\'s nothing wrong with that, but social media algorithms reward specific patterns:',
      '**1. Strong opening hooks.** AI consistently front-loads the most compelling part of the message. Instead of "I just launched my new product and I\'m so excited," AI rewrites it to "This product took 2 years to build. Here\'s why it was worth the wait."',
      '**2. Optimal length per platform.** AI knows that Twitter rewards brevity (under 100 characters), LinkedIn rewards depth (1,200–1,500 characters), and Instagram sits in the middle. It adjusts automatically.',
      '**3. Strategic emoji placement.** Not random emoji spam — AI places emojis as visual breaks that increase scan-ability. Our data shows posts with 2–4 well-placed emojis get 34% more engagement than posts with zero or 8+.',
      '**4. Clear calls-to-action.** Every high-performing post ends with a CTA. AI adds them naturally: "Save this for later," "Tag someone who needs this," "Drop a 🔥 if you agree."',
      '## The Before & After Effect',
      'Here\'s a real example from our data:',
      '**Before (manual):** "Had a great time at the conference today. Learned a lot about marketing trends for 2026."',
      '**After (AI-rewritten):** "3 marketing trends from today\'s conference that will define 2026 👇\\n\\n1. AI-first content creation\\n2. Short-form video dominance\\n3. Community > followers\\n\\nWhich one are you betting on? Drop your pick below ⬇️"',
      'The rewritten version got 847 engagements vs. 23 for the original. Same person, same audience, same platform. The only difference was the copy.',
      '## How to Start Using AI for Your Posts',
      'You don\'t need to be an AI expert. With GoViral\'s "Make It Viral" button, you write your draft in plain language, and AI handles the optimization — hooks, hashtags, emojis, CTAs, and platform-specific formatting.',
      'The best part? You stay in control. AI suggests; you approve. Your voice, amplified by data.',
      '**Ready to see the difference?** Start your free trial and try the AI rewriter on your next post.',
    ],
  },
  'hook-formulas-that-work': {
    slug: 'hook-formulas-that-work',
    title: '7 Hook Formulas That Stop the Scroll Every Time',
    excerpt:
      'The exact opening lines that turn casual scrollers into engaged followers — backed by data.',
    date: 'January 2026',
    readTime: '5 min read',
    category: 'Growth Tips',
    gradient: 'from-pink-500 to-rose-600',
    content: [
      'You have less than 1.3 seconds to stop someone from scrolling past your post. That\'s it. In that time, your hook needs to create enough curiosity, emotion, or value that the thumb pauses.',
      'We studied the top 1% of posts across 6 platforms and extracted 7 hook formulas that consistently outperform everything else.',
      '## 1. The Contrarian Hook',
      '"Everyone says X. They\'re wrong."',
      'Example: "Everyone says you need 10K followers to monetize. They\'re wrong — I made $5,000 with 800."',
      'Why it works: It challenges a belief your audience already holds, creating an information gap they need to close.',
      '## 2. The Number + Promise Hook',
      '"[Number] [things] that will [desirable outcome]"',
      'Example: "5 free tools that will save you 10 hours every week"',
      'Why it works: Numbers are specific and scannable. The promise of a clear outcome gives people a reason to read.',
      '## 3. The "I Was Wrong" Hook',
      '"I spent [time/money] on [thing] before I realized [lesson]."',
      'Example: "I spent $20,000 on Facebook ads before I realized the real growth hack was free."',
      'Why it works: Vulnerability + a lesson. People lean in because they don\'t want to make the same mistake.',
      '## 4. The Question Hook',
      '"Why does [surprising observation]?"',
      'Example: "Why do some creators with 500 followers get more engagement than accounts with 50K?"',
      'Why it works: Questions activate the brain\'s need for resolution. If the question is surprising, engagement skyrockets.',
      '## 5. The "Most People" Hook',
      '"Most people [common behavior]. Here\'s what top performers do instead."',
      'Example: "Most people post at 9 AM. Here\'s why the best creators post at 11 PM."',
      'Why it works: It creates an in-group/out-group dynamic. Everyone wants to be in the "top performers" group.',
      '## 6. The Story Hook',
      '"[Specific moment in time]. [What happened next changed everything]."',
      'Example: "Tuesday, 3 AM. My phone buzzed with a notification that changed my entire business."',
      'Why it works: Stories are the oldest form of communication. Specificity (Tuesday, 3 AM) makes it feel real.',
      '## 7. The Data Hook',
      '"We [analyzed/studied/tested] [big number]. Here\'s what we found."',
      'Example: "We analyzed 50,000 Instagram Reels. Here\'s the exact length that gets the most views."',
      'Why it works: Data implies authority and objectivity. Big numbers signal that the findings are meaningful.',
      '## How to Use These Hooks',
      'Don\'t just memorize them — internalize the pattern. Every great hook does one of three things: challenges a belief, opens a curiosity gap, or promises a specific outcome.',
      'GoViral\'s AI rewriter automatically applies these hook patterns to your drafts. Write your idea in plain language, and the AI restructures it with a scroll-stopping opening.',
      '**Try it free for 7 days** and watch your engagement transform.',
    ],
  },
  'multi-platform-strategy': {
    slug: 'multi-platform-strategy',
    title: 'The Multi-Platform Strategy Used by Top Creators',
    excerpt:
      'Why posting to one platform is leaving money on the table, and how to be everywhere without burnout.',
    date: 'January 2026',
    readTime: '7 min read',
    category: 'Strategy',
    gradient: 'from-emerald-500 to-teal-600',
    content: [
      'The average person has 7.1 social media accounts. Your audience isn\'t on one platform — they\'re on all of them. But most creators only post consistently on one or two.',
      'The result? You\'re reaching a fraction of your potential audience. Every platform you\'re not on is attention you\'re leaving on the table.',
      '## The Platform Diversification Problem',
      'The reason most creators stay on one platform is simple: it\'s exhausting to post everywhere. Each platform has different formats, character limits, hashtag strategies, and best practices.',
      'Writing a tweet, then reformatting it for LinkedIn, then creating a different version for Instagram, then adapting it for TikTok... that\'s 4x the work for every single piece of content.',
      'Or at least, it used to be.',
      '## The "Create Once, Publish Everywhere" Framework',
      'Top creators don\'t create unique content for each platform. They create one core piece of content and adapt it. Here\'s the framework:',
      '**Step 1: Write your core message.** This is the raw idea — no formatting, no hashtags, no emojis. Just the value you want to share.',
      '**Step 2: Let AI adapt it per platform.** GoViral\'s AI takes your core message and generates platform-specific versions — short and punchy for Twitter, professional for LinkedIn, visual-friendly for Instagram, and trend-aligned for TikTok.',
      '**Step 3: Schedule everything at once.** Instead of logging into 5 different apps, you schedule all versions from one dashboard. Done in minutes, not hours.',
      '## Real Results From Multi-Platform Posting',
      'Creator Sarah M. was posting only on Instagram (23K followers). After expanding to Twitter, LinkedIn, and TikTok using GoViral:',
      '- **Month 1:** +4,200 followers across new platforms',
      '- **Month 2:** +11,800 followers, first brand deal from LinkedIn',
      '- **Month 3:** TikTok video went viral (2.6M views), Instagram grew by 8K from cross-traffic',
      'Her total time spent? About 20 minutes per day — the same as before, just using better tools.',
      '## Which Platforms Should You Be On?',
      'Not all platforms are equal for every creator. Here\'s a quick guide:',
      '**B2B / Professional content:** LinkedIn + Twitter/X',
      '**Visual / Lifestyle:** Instagram + TikTok + Pinterest',
      '**Long-form / Education:** YouTube + LinkedIn',
      '**News / Commentary:** Twitter/X + Threads + Bluesky',
      '**Community / Engagement:** Facebook Groups + Telegram',
      'The sweet spot for most creators is 3–4 platforms. Enough to diversify your reach, manageable enough to stay consistent.',
      '## The Bottom Line',
      'You don\'t need to work harder. You need to work on more platforms — and let AI handle the adaptation. One post, multiple platforms, 10x the reach.',
      '**Start your 7-day free trial** and see how easy multi-platform posting can be.',
    ],
  },
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = blogPosts[slug]

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero header */}
      <div className={`bg-gradient-to-br ${post.gradient} text-white`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <Link
            href="/#blog"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to articles
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
              <Tag className="w-3 h-3" />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1 text-white/70 text-xs">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-white/80">{post.date}</p>
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <article className="prose prose-lg prose-gray max-w-none">
          {post.content.map((block, i) => {
            // Heading
            if (block.startsWith('## ')) {
              return (
                <h2
                  key={i}
                  className="text-2xl font-bold text-gray-900 mt-10 mb-4"
                >
                  {block.replace('## ', '')}
                </h2>
              )
            }

            // Bold-start paragraph (like **Step 1:** ...)
            if (block.startsWith('**') && block.includes('**')) {
              const parts = block.split(/(\*\*[^*]+\*\*)/g)
              return (
                <p key={i} className="text-gray-700 leading-relaxed mb-4">
                  {parts.map((part, j) =>
                    part.startsWith('**') && part.endsWith('**') ? (
                      <strong key={j} className="text-gray-900">
                        {part.replace(/\*\*/g, '')}
                      </strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </p>
              )
            }

            // List item
            if (block.startsWith('- ')) {
              return (
                <li key={i} className="text-gray-700 leading-relaxed ml-4 mb-2 list-disc">
                  {block.replace('- ', '')}
                </li>
              )
            }

            // Regular paragraph
            return (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">
                {block}
              </p>
            )
          })}
        </article>

        {/* CTA at bottom */}
        <div className="mt-16 p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Ready to Go Viral?
          </h3>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Start your 7-day free trial and see how AI-powered content
            optimization can transform your social media presence.
          </p>
          <Link
            href="/trial-signup"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>

        {/* More articles */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            More Articles
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {Object.values(blogPosts)
              .filter((p) => p.slug !== post.slug)
              .map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group block rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <span className="text-xs font-semibold text-indigo-600 mb-1 block">
                    {related.category}
                  </span>
                  <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                    {related.title}
                  </h4>
                  <p className="text-sm text-gray-500">{related.excerpt}</p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

