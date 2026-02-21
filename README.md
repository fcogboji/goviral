# GoViral - Social Media Management Platform 🌍

A comprehensive social media management platform that helps creators and businesses **make posts go viral globally**. Schedule posts, optimize content for maximum engagement, track analytics, and manage campaigns across multiple platforms with **REAL posting capabilities**.

## ⚡ New: Viral Optimization Engine (Latest Update)

✅ **Viral Score Analysis** - Real-time content scoring (0-100) with engagement predictions
✅ **Smart Suggestions** - AI-powered tips to improve content before posting
✅ **Trending Hashtags** - Automatic hashtag recommendations by category
✅ **Optimal Posting Times** - Best times to post for maximum reach
✅ **Engagement Predictions** - Estimated likes, shares, comments, and reach
✅ **Real Analytics Sync** - Automatic syncing of metrics from all platforms
✅ **Live Dashboard** - Real-time performance tracking with actual data

## ⚡ Production-Ready Features

✅ **Global USD Pricing** - $9 to $99/month
✅ **WhatsApp Business API** - Send messages, images, videos
✅ **Real Social Media Posting** - Facebook, Instagram, Twitter, LinkedIn, YouTube, TikTok
✅ **Automated Scheduling** - Posts publish automatically at scheduled time
✅ **Stripe + Paystack** - Global and Nigerian payment processing

## 🚀 Features

### Viral Optimization Engine (NEW)
- **Viral Score (0-100)**: Analyzes content for viral potential based on:
  - Hook strength (first line engagement)
  - Call-to-action presence
  - Emoji and hashtag usage
  - Question engagement triggers
  - Content length optimization per platform
  - Sentiment analysis
- **Smart Suggestions**: Real-time tips to improve your content
- **One-Click Optimization**: Apply AI-optimized content instantly
- **Trending Hashtags**: Category-based hashtag recommendations
- **Engagement Predictions**: Estimated reach, likes, shares, comments
- **Best Posting Times**: Platform-specific optimal posting schedules

### Analytics & Tracking (NEW)
- **Real-Time Dashboard**: Live performance metrics from actual posts
- **Platform Analytics Sync**: Automatic fetching from Facebook, Instagram, Twitter, LinkedIn, YouTube, TikTok
- **Top Performing Posts**: Track your best content
- **Engagement Rate Tracking**: Monitor overall performance
- **Platform Breakdown**: See which platforms perform best
- **Cron-Based Sync**: Auto-syncs analytics every 6 hours

### Core Features
- **Real Social Media Posting**: Actually publish to Facebook, Instagram, Twitter/X, LinkedIn, YouTube, TikTok, and WhatsApp
- **Multi-Platform Scheduling**: Automated publishing at scheduled times (every 10 minutes check)
- **WhatsApp Business API**: Send messages, images, videos to customers
- **Campaign Management**: Create and manage marketing campaigns with multiple posts
- **Global USD Pricing**: $9 (Starter), $29 (Creator), $99 (Agency)
- **Stripe + Paystack Integration**: Secure payment processing globally and in Nigeria
- **Trial System**: 7-day free trial for new users
- **Team Collaboration**: Multi-user support for agencies

### Technical Features
- **Next.js 15+**: Latest React framework with App Router
- **TypeScript**: Full type safety
- **Prisma ORM**: Database management with PostgreSQL
- **Clerk Authentication**: Secure user authentication and management
- **Neon Database**: Serverless PostgreSQL hosting
- **Tailwind CSS**: Modern, responsive design
- **Real-time Updates**: Live data synchronization

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: Clerk
- **Payments**: Stripe
- **Deployment**: Vercel
- **Styling**: Tailwind CSS, Lucide Icons

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Neon recommended)
- Clerk account
- Stripe account (for payments)

## 🚀 Quick Start

### Option 1: Quick Start (5 minutes)

See **[QUICK_START.md](QUICK_START.md)** for the fastest way to get running.

### Option 2: Complete Setup with All Integrations

See **[SETUP_GUIDE.md](SETUP_GUIDE.md)** for detailed setup of all social media APIs.

### Basic Setup:

```bash
# 1. Clone repository
git clone https://github.com/yourusername/goviral.git
cd goviral

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Setup database
npx prisma generate
npx prisma db push
npm run seed

# 5. Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**See [.env.example](.env.example) for all required environment variables.**

## 📁 Project Structure

```
goviral/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (auth)/                   # Authentication pages
│   │   ├── api/                      # API routes
│   │   │   ├── posts/
│   │   │   │   ├── publish/         # Post publishing endpoint
│   │   │   │   └── optimize/        # 🆕 Viral optimization API
│   │   │   ├── analytics/
│   │   │   │   ├── sync/            # 🆕 Analytics sync endpoint
│   │   │   │   └── route.ts         # Analytics queries
│   │   │   ├── dashboard/
│   │   │   │   └── stats/           # 🆕 Dashboard statistics API
│   │   │   └── cron/
│   │   │       ├── process-posts/   # Automated post processor
│   │   │       └── sync-analytics/  # 🆕 Analytics sync cron
│   │   ├── dashboard/                # Dashboard pages
│   │   └── layout.tsx                # Root layout
│   ├── components/                   # React components
│   │   └── Dashboard.tsx            # 🔄 Updated with real data
│   └── lib/                          # Utility libraries
│       ├── social-media/             # Social media integrations
│       │   ├── facebook.ts          # Facebook & Instagram
│       │   ├── twitter.ts           # Twitter/X API
│       │   ├── linkedin.ts          # LinkedIn API
│       │   ├── youtube.ts           # YouTube API
│       │   ├── tiktok.ts            # TikTok API
│       │   ├── whatsapp.ts          # WhatsApp Business API
│       │   ├── post-publisher.ts    # Unified publisher
│       │   ├── analytics-fetcher.ts # 🆕 Platform analytics sync
│       │   └── index.ts             # Exports
│       ├── viral-optimizer.ts       # 🆕 Viral optimization engine
│       ├── nigerian-features.ts     # Nigerian-specific features
│       └── cron/                     # Cron jobs
├── prisma/                           # Database schema
│   ├── schema.prisma                # Database models
│   └── seed.ts                      # Seed data
├── vercel.json                      # 🔄 Updated with new cron jobs
└── README.md                        # This file
```

## 📡 API Endpoints

### Viral Optimization
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/posts/optimize` | POST | Analyze content for viral potential |
| `/api/posts/optimize` | GET | Get trending hashtags & best posting times |

### Analytics
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/sync` | POST | Sync analytics from social platforms |
| `/api/analytics/sync` | GET | Get analytics summary |
| `/api/dashboard/stats` | GET | Get dashboard statistics |

### Posts
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/posts` | GET/POST | List/create posts |
| `/api/posts/[id]` | GET/PUT/DELETE | Manage individual posts |
| `/api/posts/publish` | POST | Publish post to platforms |

### Cron Jobs (Automated)
| Endpoint | Schedule | Description |
|----------|----------|-------------|
| `/api/cron/process-posts` | Every 10 min | Process scheduled posts |
| `/api/cron/sync-analytics` | Every 6 hours | Sync platform analytics |
| `/api/cron/process-trials` | Daily 1 AM | Process trial expirations |
| `/api/cron/process-recurring-billing` | Daily 2 AM | Process recurring payments |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | For Nigeria |
| `CRON_SECRET` | Cron job authentication (32+ chars) | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |

### Social Media OAuth (Optional per platform)
| Variable | Platform |
|----------|----------|
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | Facebook & Instagram |
| `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET` | Twitter/X |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | YouTube |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | LinkedIn |
| `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET` | TikTok |

### Database Schema

The application uses the following main models:

- **User**: User accounts and profiles
- **Subscription**: User subscription plans
- **Plan**: Available subscription plans
- **Post**: Social media posts
- **Campaign**: Marketing campaigns
- **PlatformIntegration**: Connected social platforms
- **Analytics**: Performance metrics
- **Payment**: Payment records

## 🚀 Deployment

### Quick Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Deploy (or connect repo in Vercel dashboard)
vercel --prod
```

**Important:** After deploying:
1. Add all environment variables in Vercel
2. Update social media OAuth redirect URLs with production domain
3. Update Clerk settings with production URLs
4. Update Paystack webhook URL

**See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment checklist.**

### Automated Features

- **Cron Jobs**: Vercel automatically runs post scheduler every 10 minutes
- **Auto-scaling**: Handles traffic spikes automatically
- **CDN**: Static assets cached globally
- **SSL**: HTTPS enabled by default

## 🔐 Security Features

- **Authentication**: Clerk handles user authentication securely
- **Authorization**: Role-based access control
- **Data Validation**: Input validation on all API endpoints
- **Rate Limiting**: API rate limiting for abuse prevention
- **CORS**: Proper CORS configuration
- **Environment Variables**: Sensitive data stored securely

## 📊 Analytics & Monitoring

- **User Analytics**: Track user engagement and usage
- **Performance Monitoring**: Vercel Analytics integration
- **Error Tracking**: Built-in error boundaries and logging
- **Database Monitoring**: Prisma Studio for database management

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the docs folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join discussions for feature requests
- **Email**: support@goviral.com

## 🗺️ Roadmap

- [x] AI-powered content suggestions (Viral Optimizer)
- [x] Advanced analytics dashboard (Real-time metrics)
- [x] Viral score and engagement predictions
- [x] Platform analytics sync
- [ ] Team collaboration features
- [ ] White-label solutions
- [ ] API for third-party integrations
- [ ] Mobile app development
- [ ] Advanced scheduling algorithms
- [ ] Social media listening tools
- [ ] A/B testing for content
- [ ] Competitor analysis

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Clerk](https://clerk.com/) for authentication
- [Prisma](https://prisma.io/) for database management
- [Paystack](https://paystack.com/) for payment processing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vercel](https://vercel.com/) for hosting

---

Built with ❤️ for creators and businesses worldwide.
# uk2naija-marketplace
