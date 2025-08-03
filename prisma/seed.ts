// prisma/seed.ts - Database seed script to create default plans
import { PrismaClient, Prisma, CampaignStatus, PostStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create default plans
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { name: 'Starter' },
      update: {},
      create: {
        name: 'Starter',
        price: 9.00,
        description: 'Perfect for individual creators getting started',
        features: [
          '5 social accounts',
          '50 posts per month',
          'Basic analytics',
          'Email support',
          'Schedule posts',
          'Basic content studio'
        ],
        maxPosts: 50,
        maxPlatforms: 5
      }
    }),
    prisma.plan.upsert({
      where: { name: 'Creator' },
      update: {},
      create: {
        name: 'Creator',
        price: 29.00,
        description: 'Best for growing creators and small businesses',
        features: [
          '15 social accounts',
          '200 posts per month',
          'Advanced analytics',
          'AI content suggestions',
          'Priority support',
          'Bulk scheduling',
          'Content studio access',
          'Team collaboration'
        ],
        maxPosts: 200,
        maxPlatforms: 15
      }
    }),
    prisma.plan.upsert({
      where: { name: 'Agency' },
      update: {},
      create: {
        name: 'Agency',
        price: 99.00,
        description: 'Perfect for agencies and large teams',
        features: [
          'Unlimited accounts',
          'Unlimited posts',
          'White-label reports',
          'Team collaboration',
          'Dedicated support',
          'Custom integrations',
          'Advanced analytics',
          'Priority processing'
        ],
        maxPosts: 999999, // Unlimited
        maxPlatforms: 999  // Unlimited
      }
    })
  ])

  console.log('✅ Plans created:', plans.map(p => p.name).join(', '))

  // Create sample users (if they don't exist)
  const sampleUsers = [
    {
      clerkId: 'user_2sample1',
      email: 'demo1@goviral.com',
      firstName: 'John',
      lastName: 'Creator',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      clerkId: 'user_2sample2',
      email: 'demo2@goviral.com',
      firstName: 'Sarah',
      lastName: 'Agency',
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      clerkId: 'user_2sample3',
      email: 'demo3@goviral.com',
      firstName: 'Mike',
      lastName: 'Starter',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ]

  for (const userData of sampleUsers) {
    await prisma.user.upsert({
      where: { clerkId: userData.clerkId },
      update: {},
      create: userData
    })
  }

  console.log('✅ Sample users created')

  // Create subscriptions for sample users
  const user1 = await prisma.user.findUnique({ where: { clerkId: 'user_2sample1' } })
  const user2 = await prisma.user.findUnique({ where: { clerkId: 'user_2sample2' } })
  const user3 = await prisma.user.findUnique({ where: { clerkId: 'user_2sample3' } })
  
  const starterPlan = await prisma.plan.findUnique({ where: { name: 'Starter' } })
  const creatorPlan = await prisma.plan.findUnique({ where: { name: 'Creator' } })
  const agencyPlan = await prisma.plan.findUnique({ where: { name: 'Agency' } })

  // User 1 - Creator Plan (Active)
  if (user1 && creatorPlan) {
    await prisma.subscription.upsert({
      where: { userId: user1.id },
      update: {},
      create: {
        userId: user1.id,
        planId: creatorPlan.id,
        planType: 'Creator',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    })
  }

  // User 2 - Agency Plan (Active)
  if (user2 && agencyPlan) {
    await prisma.subscription.upsert({
      where: { userId: user2.id },
      update: {},
      create: {
        userId: user2.id,
        planId: agencyPlan.id,
        planType: 'Agency',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    })
  }

  // User 3 - Starter Plan (Trial)
  if (user3 && starterPlan) {
    await prisma.subscription.upsert({
      where: { userId: user3.id },
      update: {},
      create: {
        userId: user3.id,
        planId: starterPlan.id,
        planType: 'Starter',
        status: 'trial',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days trial
      }
    })
  }

  console.log('✅ Subscriptions created')

  // Create sample posts
  const samplePosts = [
    {
      content: "🚀 Exciting news! We're launching our new AI-powered content creation tool next week. Stay tuned for more updates! #GoViral #SocialMedia",
      platforms: ['twitter', 'linkedin'],
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      scheduledFor: null
    },
    {
      content: "Check out our latest blog post about social media trends in 2024. Link in bio! 📈 #SocialMediaMarketing #Trends",
      platforms: ['instagram', 'facebook'],
      status: PostStatus.SCHEDULED,
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      publishedAt: null
    },
    {
      content: "Join us for our weekly webinar on content marketing strategies. Register now! #Webinar #Marketing",
      platforms: ['linkedin', 'twitter'],
      status: PostStatus.DRAFT,
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
      scheduledFor: null,
      publishedAt: null
    },
    {
      content: "Behind the scenes of our content creation process. What do you think? 🎬 #BehindTheScenes #ContentCreation",
      platforms: ['instagram', 'tiktok'],
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
      scheduledFor: null
    }
  ]

  for (const postData of samplePosts) {
    if (user1) {
      await prisma.post.create({
        data: {
          userId: user1.id,
          content: postData.content,
          platforms: postData.platforms,
          status: postData.status,
          imageUrl: postData.imageUrl,
          publishedAt: postData.publishedAt,
          scheduledFor: postData.scheduledFor
        }
      })
    }
  }

  console.log('✅ Sample posts created')

  // Create sample analytics data
  if (user1) {
    const posts = await prisma.post.findMany({ where: { userId: user1.id } })
    
    for (const post of posts) {
      if (post.status === 'PUBLISHED') {
        // Create analytics for each platform the post was published to
        for (const platform of post.platforms) {
          const analyticsData = [
            { metric: 'likes', value: Math.floor(Math.random() * 500) + 50 },
            { metric: 'comments', value: Math.floor(Math.random() * 100) + 10 },
            { metric: 'shares', value: Math.floor(Math.random() * 50) + 5 },
            { metric: 'reach', value: Math.floor(Math.random() * 5000) + 1000 },
            { metric: 'impressions', value: Math.floor(Math.random() * 8000) + 2000 },
            { metric: 'views', value: Math.floor(Math.random() * 3000) + 500 }
          ]

          for (const analytics of analyticsData) {
            await prisma.analytics.create({
              data: {
                userId: user1.id,
                postId: post.id,
                platform: platform,
                metric: analytics.metric,
                value: analytics.value,
                date: new Date()
              }
            })
          }
        }
      }
    }
  }

  console.log('✅ Sample analytics created')

  // Create sample platform integrations with properly typed metadata
  if (user1) {
    const platformIntegrations = [
      {
        platform: 'instagram',
        platformUserId: 'insta_user_12345_demo1', // Unique ID for this user on Instagram
        accountName: '@john_creator_insta', // Display name on Instagram
        accessToken: 'sample_instagram_token',
        refreshToken: 'sample_instagram_refresh',
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Expires in 60 days
        isConnected: true,
        profileUrl: 'https://instagram.com/john_creator_insta',
        profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        metadata: {
          username: '@john_creator',
          displayName: 'John Creator',
          followers: 1250,
          posts: 45,
          verified: false
        },
        isActive: true, 
      },
      {
        platform: 'twitter',
        platformUserId: 'twitter_user_67890_demo1', // Unique ID for this user on Twitter
        accountName: '@JohnCreatorX', // Display name on Twitter
        accessToken: 'sample_twitter_token',
        refreshToken: 'sample_twitter_refresh',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Expires in 90 days
        isConnected: true,
        profileUrl: 'https://twitter.com/JohnCreatorX',
        profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        metadata: {
          username: '@JohnCreator',
          displayName: 'John Creator',
          followers: 890,
          posts: 23,
          verified: true
        },
        isActive: true,
      },
      {
        platform: 'linkedin',
        platformUserId: 'linkedin_user_abcde_demo1', // Unique ID for this user on LinkedIn
        accountName: 'John Creator', // Display name on LinkedIn
        accessToken: 'sample_linkedin_token',
        refreshToken: 'sample_linkedin_refresh',
        expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // Expires in 120 days
        isConnected: true,
        profileUrl: 'https://linkedin.com/in/johncreator',
        profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        metadata: {
          username: 'john-creator',
          displayName: 'John Creator',
          followers: 450,
          posts: 12,
          verified: false,
          company: 'GoViral'
        },
        isActive: true,
      },
      {
        platform: 'facebook',
        platformUserId: 'facebook_user_fghij_demo1', // Unique ID for this user on Facebook
        accountName: 'John Creator Page', // Display name for Facebook Page
        accessToken: 'sample_facebook_token',
        refreshToken: 'sample_facebook_refresh',
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // Expires in 180 days
        isConnected: true,
        profileUrl: 'https://facebook.com/JohnCreatorPage',
        profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        metadata: {
          username: 'john.creator.page',
          displayName: 'John Creator Page',
          followers: 320,
          posts: 8,
          verified: false,
          pageId: 'sample_page_id'
        },
        isActive: true,
      }
    ];

    for (const integration of platformIntegrations) {
      await prisma.platformIntegration.upsert({
        where: {
          // Use the @@unique([userId, platform]) constraint for the where clause
          userId_platform: {
            userId: user1.id,
            platform: integration.platform
          }
        },
        update: {
          platformUserId: integration.platformUserId,
          accountName: integration.accountName,
          accessToken: integration.accessToken,
          refreshToken: integration.refreshToken,
          expiresAt: integration.expiresAt,
          isConnected: integration.isConnected,
          profileUrl: integration.profileUrl,
          profileImageUrl: integration.profileImageUrl,
          // connectedAt has @default(now()) so no need to update unless you explicitly want to change it
          metadata: JSON.parse(JSON.stringify(integration.metadata || {})), // Handle Json? by providing {} if metadata is absent
          isActive: integration.isActive,
        },
        create: {
          userId: user1.id,
          platform: integration.platform,
          platformUserId: integration.platformUserId,
          accountName: integration.accountName,
          accessToken: integration.accessToken,
          refreshToken: integration.refreshToken,
          expiresAt: integration.expiresAt,
          isConnected: integration.isConnected,
          profileUrl: integration.profileUrl,
          profileImageUrl: integration.profileImageUrl,
          // connectedAt has @default(now()) in schema, so we omit it here
          metadata: JSON.parse(JSON.stringify(integration.metadata || {})), // Handle Json? by providing {} if metadata is absent
          isActive: integration.isActive,
        }
      });
    }
  }

  console.log('✅ Sample platform integrations created')

  // Create sample campaigns - FIXED WITH PROPER ENUMS
  if (user1) {
    const campaigns = [
      {
        name: 'Summer Product Launch',
        title: 'Summer Product Launch',
        description: 'Promoting our new summer collection across all platforms',
        budget: 500.00,
        targetAudience: 'Young adults 18-35',
        objectives: ['brand-awareness', 'engagement', 'conversions'],
        platforms: ['instagram', 'facebook', 'twitter'],
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        contentType: 'mixed',
        hashtags: ['#SummerCollection', '#NewLaunch', '#Fashion'],
        status: CampaignStatus.ACTIVE // Fixed: Use proper enum
      },
      {
        name: 'Holiday Marketing Campaign',
        title: 'Holiday Marketing Campaign',
        description: 'Special holiday promotions and content',
        budget: 1000.00,
        targetAudience: 'Families and gift buyers',
        objectives: ['sales', 'brand-awareness'],
        platforms: ['instagram', 'facebook', 'linkedin'],
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        contentType: 'promotional',
        hashtags: ['#HolidaySpecial', '#GiftIdeas', '#Sale'],
        status: CampaignStatus.DRAFT // Fixed: Use proper enum
      }
    ]

    for (const campaignData of campaigns) {
      await prisma.campaign.create({
        data: {
          userId: user1.id,
          name: campaignData.name,
          title: campaignData.title,
          description: campaignData.description,
          budget: campaignData.budget,
          targetAudience: campaignData.targetAudience,
          objectives: campaignData.objectives,
          platforms: campaignData.platforms,
          startDate: campaignData.startDate,
          endDate: campaignData.endDate,
          contentType: campaignData.contentType,
          hashtags: campaignData.hashtags,
          status: campaignData.status
        }
      })
    }
  }

  console.log('✅ Sample campaigns created')

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