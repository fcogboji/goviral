# GoViral Setup Guide

## Complete Setup Guide for Nigerian Social Media Management Platform

This guide will help you set up GoViral with all social media integrations, payment processing, and Nigerian-focused features.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Authentication Setup (Clerk)](#authentication-setup)
4. [Payment Integration (Paystack)](#payment-integration)
5. [Social Media API Setup](#social-media-api-setup)
6. [SMS Notifications](#sms-notifications)
7. [Deployment](#deployment)
8. [Testing](#testing)

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon recommended)
- Domain name (for production)
- Nigerian phone number for testing

### Required Accounts

- [Clerk](https://clerk.com) - Authentication
- [Paystack](https://paystack.com) - Payment processing
- [Neon](https://neon.tech) or any PostgreSQL provider
- Social media developer accounts (see below)

---

## Database Setup

### 1. Create Neon Database

1. Go to [Neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

### 2. Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with Nigerian pricing
npm run seed
```

### 3. Verify Setup

```bash
# Open Prisma Studio to view data
npx prisma studio
```

---

## Authentication Setup

### Clerk Configuration

1. **Create Clerk Application**
   - Go to [dashboard.clerk.com](https://dashboard.clerk.com)
   - Create new application
   - Choose "Email & Phone" authentication

2. **Configure API Keys**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

3. **Set up Webhook** (for user sync)
   - In Clerk Dashboard → Webhooks
   - Add endpoint: `https://yourapp.com/api/webhooks/clerk`
   - Select events: `user.created`, `user.updated`
   - Copy webhook secret:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

---

## Payment Integration

### Paystack Setup (Nigerian Payments)

1. **Create Paystack Account**
   - Go to [paystack.com](https://paystack.com)
   - Complete business verification
   - Get your test keys from Settings → API Keys

2. **Add Keys to Environment**
   ```env
   PAYSTACK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_PAYSTACK_PUBLISHABLE_KEY=pk_test_...
   ```

3. **Webhook Configuration**
   - In Paystack Dashboard → Settings → Webhooks
   - Add: `https://yourapp.com/api/payment/verify`
   - Copy webhook secret

4. **Test Payments**
   Use test cards:
   - Success: 4084084084084081
   - Decline: 5060666666666666666

---

## Social Media API Setup

### 1. Facebook & Instagram

**Requirements:**
- Facebook Developer account
- Business Facebook Page
- Instagram Business Account linked to Facebook Page

**Setup Steps:**

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create new app → Business Type
3. Add products: "Facebook Login" and "Instagram Graph API"
4. Configure OAuth redirect: `https://yourapp.com/api/auth/facebook/callback`
5. Get credentials:

```env
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_REDIRECT_URI=https://yourapp.com/api/auth/facebook/callback
```

**Required Permissions:**
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`
- `instagram_basic`
- `instagram_content_publish`
- `instagram_manage_insights`

**Testing:**
1. Add test users in App Dashboard
2. Connect Facebook Page
3. Link Instagram Business account

---

### 2. Twitter/X

**Setup Steps:**

1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Create project → Get "Elevated" access (required for posting)
3. Enable OAuth 2.0 with PKCE
4. Add callback: `https://yourapp.com/api/auth/twitter/callback`

```env
TWITTER_CLIENT_ID=your-client-id
TWITTER_CLIENT_SECRET=your-client-secret
TWITTER_REDIRECT_URI=https://yourapp.com/api/auth/twitter/callback
```

**Required Scopes:**
- `tweet.read`
- `tweet.write`
- `users.read`
- `offline.access` (for refresh tokens)

---

### 3. LinkedIn

**Setup Steps:**

1. Go to [linkedin.com/developers](https://www.linkedin.com/developers)
2. Create app
3. Add redirect URL: `https://yourapp.com/api/auth/linkedin/callback`
4. Request access to "Marketing Developer Platform"

```env
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret
LINKEDIN_REDIRECT_URI=https://yourapp.com/api/auth/linkedin/callback
```

**Required Scopes:**
- `r_liteprofile`
- `r_emailaddress`
- `w_member_social`
- `r_organization_social`

---

### 4. YouTube

**Setup Steps:**

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project
3. Enable "YouTube Data API v3"
4. Create OAuth 2.0 credentials
5. Add redirect: `https://yourapp.com/api/auth/youtube/callback`

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://yourapp.com/api/auth/youtube/callback
```

**Required Scopes:**
- `https://www.googleapis.com/auth/youtube.upload`
- `https://www.googleapis.com/auth/youtube`
- `https://www.googleapis.com/auth/youtube.force-ssl`

---

### 5. TikTok

**Setup Steps:**

1. Go to [developers.tiktok.com](https://developers.tiktok.com)
2. Create app (requires business verification)
3. Apply for Content Posting API access
4. Add redirect: `https://yourapp.com/api/auth/tiktok/callback`

```env
TIKTOK_CLIENT_KEY=your-client-key
TIKTOK_CLIENT_SECRET=your-client-secret
TIKTOK_REDIRECT_URI=https://yourapp.com/api/auth/tiktok/callback
```

**Required Scopes:**
- `video.upload`
- `video.publish`
- `user.info.basic`

**Note:** TikTok API access requires approval and may take 2-4 weeks.

---

### 6. WhatsApp Business API

**Setup Steps:**

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create Business App
3. Add "WhatsApp" product
4. Set up phone number
5. Get Business Account ID and Phone Number ID

```env
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-permanent-token
WHATSAPP_VERIFY_TOKEN=your-custom-verify-token
```

**WhatsApp Webhook Setup:**
- Callback URL: `https://yourapp.com/api/webhooks/whatsapp`
- Verify token: Use your custom token from `.env`
- Subscribe to: `messages`, `message_status`

**Testing:**
- Use test phone numbers in WhatsApp Business settings
- Test with your own WhatsApp number

---

## SMS Notifications

### Termii Setup (Recommended for Nigeria)

1. Sign up at [termii.com](https://termii.com)
2. Verify your account
3. Get API key from Dashboard

```env
SMS_API_KEY=your-termii-api-key
SMS_SENDER_ID=GoViral
```

**Alternative Providers:**
- [Africa's Talking](https://africastalking.com)
- [Bulk SMS Nigeria](https://www.bulksmsnigeria.com)

---

## Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Setup complete"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import repository
   - Framework: Next.js

3. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Ensure `NEXT_PUBLIC_APP_URL` points to your Vercel domain

4. **Enable Cron Jobs**
   - Vercel automatically detects `vercel.json` cron configuration
   - Cron runs every 10 minutes to process scheduled posts

5. **Deploy**
   ```bash
   vercel --prod
   ```

---

## Testing

### Test Checklist

#### Authentication
- [ ] Sign up with email
- [ ] Sign in
- [ ] Email verification works

#### Payments
- [ ] View pricing plans (in Naira)
- [ ] Paystack payment flow
- [ ] Subscription activation
- [ ] Trial period works

#### Social Media Connections
- [ ] Connect Facebook
- [ ] Connect Instagram
- [ ] Connect Twitter/X
- [ ] Connect LinkedIn
- [ ] Connect YouTube
- [ ] Connect TikTok
- [ ] Connect WhatsApp Business

#### Posting
- [ ] Create post with text
- [ ] Add images to post
- [ ] Add video to post
- [ ] Select multiple platforms
- [ ] Schedule for later
- [ ] Publish immediately
- [ ] View post results

#### Nigerian Features
- [ ] Prices shown in Naira (₦)
- [ ] Trending Nigerian hashtags suggested
- [ ] WAT timezone displayed correctly
- [ ] SMS notifications work
- [ ] Nigerian phone number formatting

#### Cron Jobs
- [ ] Scheduled posts publish automatically
- [ ] Token refresh works
- [ ] Failed posts retry

---

## Common Issues

### Issue: "Database connection failed"
**Solution:** Check DATABASE_URL format and SSL mode

### Issue: "Clerk webhook not working"
**Solution:**
1. Verify webhook URL is accessible
2. Check CLERK_WEBHOOK_SECRET is set
3. Test with Clerk Dashboard → Webhooks → Test

### Issue: "Social media posts failing"
**Solution:**
1. Check access tokens haven't expired
2. Verify OAuth scopes are correct
3. Check platform API status pages

### Issue: "Cron jobs not running"
**Solution:**
1. Verify CRON_SECRET matches in Vercel
2. Check Vercel cron logs
3. Ensure `/api/cron/process-posts` is accessible

---

## Next Steps

1. **Complete App Review** for each social media platform
2. **Move to Production Keys** (Paystack, social media APIs)
3. **Set up Monitoring** (Sentry, LogRocket)
4. **Configure Email** for notifications
5. **Add Analytics** tracking
6. **Test with Real Users** in Nigeria

---

## Support

For issues or questions:
- GitHub Issues: [Your repo URL]
- Email: support@goviral.com
- WhatsApp: +234-XXX-XXX-XXXX

---

## Nigerian-Specific Tips

1. **Pricing:** ₦5,000 - ₦45,000 is competitive for Nigerian market
2. **Payment Methods:** Consider adding bank transfer option via Paystack
3. **Peak Times:** Best posting times are 7am, 12pm, 5pm, 9pm WAT
4. **Content:** Nigerian-focused hashtags boost engagement by 40%
5. **Support:** Offer WhatsApp support - very popular in Nigeria

---

Built with ❤️ for Nigerian creators and businesses.
