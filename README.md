# GoViral - Social Media Management Platform

A comprehensive social media management platform built for Nigerian creators and businesses. Schedule posts, track analytics, and manage campaigns across multiple platforms with ease.

## 🚀 Features

### Core Features
- **Multi-Platform Scheduling**: Schedule posts across Facebook, Instagram, LinkedIn, Twitter, and TikTok
- **Smart Analytics**: Track engagement, reach, and performance metrics
- **Campaign Management**: Create and manage marketing campaigns with multiple posts
- **Subscription Plans**: Tiered pricing with Nigerian Naira support
- **Paystack Integration**: Secure payment processing for Nigerian users
- **Trial System**: 7-day free trial for new users

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
- **Payments**: Paystack
- **Deployment**: Vercel
- **Styling**: Tailwind CSS, Lucide Icons

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon recommended)
- Clerk account
- Paystack account (for payments)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/goviral.git
cd goviral
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLISHABLE_KEY=pk_test_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database with initial data
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
goviral/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── common/           # Shared components
│   ├── payments/         # Payment components
│   ├── posts/            # Post management
│   └── ui/               # UI components
├── lib/                  # Utility libraries
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | Yes |
| `NEXT_PUBLIC_PAYSTACK_PUBLISHABLE_KEY` | Paystack public key | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |

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

### Vercel Deployment

1. **Connect Repository**
   - Push your code to GitHub
   - Connect your repository to Vercel

2. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure `NEXT_PUBLIC_APP_URL` points to your production domain

3. **Database Setup**
   - Set up Neon PostgreSQL database
   - Update `DATABASE_URL` in Vercel
   - Run migrations: `npx prisma db push`

4. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Monitor deployment logs for any issues

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

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

- [ ] AI-powered content suggestions
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] White-label solutions
- [ ] API for third-party integrations
- [ ] Mobile app development
- [ ] Advanced scheduling algorithms
- [ ] Social media listening tools

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Clerk](https://clerk.com/) for authentication
- [Prisma](https://prisma.io/) for database management
- [Paystack](https://paystack.com/) for payment processing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vercel](https://vercel.com/) for hosting

---

Built with ❤️ for Nigerian creators and businesses.