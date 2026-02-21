// prisma/seed.ts - Database seed script to create default plans
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create default plans (USD pricing — see src/lib/plan-features.ts for cost breakdown)
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { name: 'Starter' },
      update: {
        price: 29.00,
        priceNGN: 45000,
        priceGBP: 23,
        yearlyMonthlyPrice: 22,
        yearlyMonthlyPriceNGN: 34000,
        yearlyMonthlyPriceGBP: 17,
        description: 'Perfect for creators & small businesses',
        features: [
          'Connect up to 5 social platforms',
          '150 posts per month',
          'AI viral rewriter (Make it Viral 🚀)',
          'Advanced analytics',
          'Viral score & suggestions',
          'Bulk scheduling',
          'Email support'
        ],
      },
      create: {
        name: 'Starter',
        price: 29.00,
        priceNGN: 45000,
        priceGBP: 23,
        yearlyMonthlyPrice: 22,
        yearlyMonthlyPriceNGN: 34000,
        yearlyMonthlyPriceGBP: 17,
        currency: 'USD',
        description: 'Perfect for creators & small businesses',
        features: [
          'Connect up to 5 social platforms',
          '150 posts per month',
          'AI viral rewriter (Make it Viral 🚀)',
          'Advanced analytics',
          'Viral score & suggestions',
          'Bulk scheduling',
          'Email support'
        ],
        maxPosts: 150,
        maxPlatforms: 5,
        maxWhatsAppMessages: 0,
        trialDays: 7,
        sortOrder: 0,
        isActive: true
      }
    }),
    prisma.plan.upsert({
      where: { name: 'Pro' },
      update: {
        price: 59.00,
        priceNGN: 90000,
        priceGBP: 47,
        yearlyMonthlyPrice: 45,
        yearlyMonthlyPriceNGN: 69000,
        yearlyMonthlyPriceGBP: 36,
        description: 'For agencies & power users',
        features: [
          'Unlimited social platforms',
          'Unlimited posts per month',
          'AI viral rewriter (Make it Viral 🚀)',
          'Platform-specific AI captions',
          'Trending topics & hashtags',
          'Advanced analytics & reports',
          'Bulk scheduling',
          'Team collaboration',
          'Custom branding',
          'Priority support'
        ],
      },
      create: {
        name: 'Pro',
        price: 59.00,
        priceNGN: 90000,
        priceGBP: 47,
        yearlyMonthlyPrice: 45,
        yearlyMonthlyPriceNGN: 69000,
        yearlyMonthlyPriceGBP: 36,
        currency: 'USD',
        description: 'For agencies & power users',
        features: [
          'Unlimited social platforms',
          'Unlimited posts per month',
          'AI viral rewriter (Make it Viral 🚀)',
          'Platform-specific AI captions',
          'Trending topics & hashtags',
          'Advanced analytics & reports',
          'Bulk scheduling',
          'Team collaboration',
          'Custom branding',
          'Priority support'
        ],
        maxPosts: -1,
        maxPlatforms: -1,
        maxWhatsAppMessages: 0,
        trialDays: 7,
        sortOrder: 1,
        isActive: true
      }
    })
  ])

  console.log('✅ Plans created:', plans.map((p: any) => p.name).join(', '))

  // NOTE: Demo users have been removed. Only plans and blog posts are seeded.
  // Real users will be created when they sign up through Clerk authentication.

  // Create sample blog posts
  const blogPosts = [
    {
      title: 'The Ultimate Guide to Social Media Marketing in 2024',
      slug: 'ultimate-guide-social-media-marketing-2024',
      excerpt: 'Learn the latest strategies and trends for effective social media marketing this year.',
      content: 'Social media marketing continues to evolve rapidly. In this comprehensive guide, we\'ll explore the most effective strategies for 2024...',
      category: 'Marketing',
      readTime: '8 min read',
      published: true,
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop'
    },
    {
      title: '10 Content Creation Tools Every Creator Needs',
      slug: 'content-creation-tools-every-creator-needs',
      excerpt: 'Discover the essential tools that will streamline your content creation process.',
      content: 'Creating engaging content consistently can be challenging. Here are the top 10 tools that will help you...',
      category: 'Tools',
      readTime: '5 min read',
      published: true,
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop'
    },
    {
      title: 'How to Build an Authentic Brand Voice on Social Media',
      slug: 'build-authentic-brand-voice-social-media',
      excerpt: 'Learn how to develop and maintain a consistent brand voice across all your social media platforms.',
      content: 'Your brand voice is what sets you apart from competitors. Here\'s how to develop an authentic voice...',
      category: 'Branding',
      readTime: '6 min read',
      published: false,
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop'
    }
  ]

  for (const blogData of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: blogData.slug },
      update: {},
      create: blogData
    })
  }

  console.log('✅ Sample blog posts created')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })