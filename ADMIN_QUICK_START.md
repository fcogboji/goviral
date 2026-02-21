# GoViral - Admin Quick Start Guide

**Get your admin access up and running in 5 minutes!**

---

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database (Neon recommended)
- [ ] Clerk account (for authentication)
- [ ] Stripe account (for payments)
- [ ] Social media OAuth apps created (optional, for full functionality)

---

## Step 1: Environment Setup (2 minutes)

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in the required variables:**

   **Essential (minimum to run):**
   ```bash
   # Database
   DATABASE_URL="postgresql://..."

   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   CLERK_WEBHOOK_SECRET="whsec_..."

   # Stripe Payments
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."

   # App URLs
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_API_URL="http://localhost:3000/api"

   # Cron Security
   CRON_SECRET="your-random-secret-string-here"
   ```

   **Optional (for full platform integration):**
   - Facebook/Instagram OAuth
   - Twitter/X OAuth
   - LinkedIn OAuth
   - Google/YouTube OAuth
   - TikTok OAuth
   - WhatsApp Business API
   - Resend Email API

---

## Step 2: Database Setup (1 minute)

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with pricing plans and sample data
npm run seed
```

**Expected output:**
```
✅ Plans created: Starter, Creator, Agency
✅ Sample blog posts created
🎉 Database seeding completed!
```

---

## Step 3: Grant Admin Access (1 minute)

**After you sign up in the app**, run:

```bash
npm run set-admin
```

**Expected output:**
```
✅ User friday.ogboji100@gmail.com has been granted admin access
✅ Audit log created
```

**Alternative method (if script fails):**
```bash
npx prisma studio
# 1. Open User table
# 2. Find your email: friday.ogboji100@gmail.com
# 3. Change "role" field to "admin"
# 4. Save
```

---

## Step 4: Start Development Server (30 seconds)

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## Step 5: Verify Admin Access (30 seconds)

1. **Sign up** at http://localhost:3000/sign-up
   - Use email: `friday.ogboji100@gmail.com`
   - Complete Clerk signup

2. **Grant admin access:**
   ```bash
   npm run set-admin
   ```

3. **Access admin panel:**
   - Visit: http://localhost:3000/admin/dashboard
   - You should see the admin dashboard with metrics

---

## Pricing Plans Configured

Your platform is ready with these plans:

| Plan | Price | Platforms | Posts/Month | Features |
|------|-------|-----------|-------------|----------|
| **Starter** | $9/month | Up to 3 | 50 | Basic analytics, AI suggestions, Email support |
| **Creator** | $29/month | Up to 10 | 200 | Advanced analytics, AI generation, WhatsApp, Priority support |
| **Agency** | $99/month | Unlimited | Unlimited | Everything + Team, API, Custom branding, 24/7 support |

---

## What's Working Out of the Box

✅ **User Authentication** - Clerk handles signup, login, passwords
✅ **Subscription System** - Stripe integration with 7-day free trial
✅ **Admin Dashboard** - Full admin panel with 12 sections
✅ **Post Scheduling** - Users can create and schedule posts
✅ **Analytics Tracking** - Basic user and content analytics
✅ **Email System** - Resend integration (if configured)

---

## What Needs Social Media OAuth (Optional)

To enable **actual posting** to social media, you need to set up OAuth:

🔧 **Facebook & Instagram**
- Create app at: https://developers.facebook.com
- Add: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`

🔧 **Twitter/X**
- Create app at: https://developer.twitter.com
- Add: `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`

🔧 **LinkedIn**
- Create app at: https://developer.linkedin.com
- Add: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`

🔧 **YouTube**
- Create app at: https://console.cloud.google.com
- Add: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

🔧 **TikTok**
- Create app at: https://developers.tiktok.com
- Add: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`

🔧 **WhatsApp Business**
- Setup at: https://business.facebook.com
- Add: `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`

**See `OAUTH_SETUP_GUIDE.md` for detailed instructions.**

---

## Admin Panel Overview

Once logged in as admin, access these sections:

### `/admin/dashboard`
- Total users, subscriptions, revenue
- Recent activity and quick stats

### `/admin/users`
- Manage all users
- Change roles (free → premium → admin)
- View subscription status

### `/admin/posts`
- View all posts across platform
- Moderate content
- Troubleshoot failed posts

### `/admin/billing`
- Subscription overview
- Revenue metrics
- Premium users list

### `/admin/transactions`
- All payment records
- Failed payments
- Refund management

### `/admin/analytics`
- User growth charts
- Platform usage stats
- Revenue trends

### `/admin/audit-logs`
- Track admin actions
- Security monitoring
- System events

### More Sections:
- Campaigns, Plans, Platforms, API Keys, Settings

---

## Testing the System

### Test User Signup
```bash
# 1. Visit http://localhost:3000
# 2. Click "Get Started"
# 3. Sign up with test email
# 4. Should redirect to dashboard
```

### Test Subscription Flow
```bash
# 1. Click on "Upgrade" in dashboard
# 2. Select a plan (Starter, Creator, Agency)
# 3. Use Stripe test card: 4242 4242 4242 4242
# 4. Any future expiry date
# 5. Any CVV (123)
# 6. Should create subscription
```

**Stripe Test Cards:**
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **3D Secure:** 4000 0027 6000 3184

### Test Post Creation
```bash
# 1. Go to /dashboard/posts
# 2. Click "Create Post"
# 3. Add content, select platforms
# 4. Schedule for future time
# 5. Post should appear in admin panel
```

### Test Admin Functions
```bash
# 1. Go to /admin/users
# 2. Find a test user
# 3. Change role to "premium"
# 4. Should update immediately
```

---

## Automated Cron Jobs

Your platform runs these background jobs:

### 1. Post Publisher (Every 10 minutes)
- **URL:** `/api/cron/process-posts`
- **Function:** Publishes scheduled posts automatically
- **Monitor:** Check Vercel logs or audit logs

### 2. Trial Manager (Daily at 1 AM)
- **URL:** `/api/cron/process-trials`
- **Function:** Checks trial expiry, sends reminders
- **Monitor:** Check subscription status in admin

### 3. Billing Processor (Daily at 2 AM)
- **URL:** `/api/cron/process-recurring-billing`
- **Function:** Processes recurring subscriptions
- **Monitor:** Check transactions in admin panel

**Note:** Cron jobs require `CRON_SECRET` in headers for security.

---

## Common First-Time Issues

### ❌ "Can't access admin panel"
**Solution:**
```bash
# Make sure you ran set-admin AFTER signing up
npm run set-admin

# Verify in database:
npx prisma studio
# Check User table → role should be "admin"
```

### ❌ "Database connection failed"
**Solution:**
```bash
# Check DATABASE_URL in .env.local
# Must be a valid PostgreSQL connection string

# Test connection:
npx prisma db push
```

### ❌ "Clerk webhook failed"
**Solution:**
```bash
# In Clerk Dashboard → Webhooks
# Add endpoint: https://your-domain.com/api/webhooks/clerk
# Or for local: https://your-ngrok-url/api/webhooks/clerk

# Copy webhook secret to:
CLERK_WEBHOOK_SECRET="whsec_..."
```

### ❌ "Stripe checkout not working"
**Solution:**
```bash
# Verify Stripe keys in .env.local
# Make sure you're using TEST keys for development

# In Stripe Dashboard → Webhooks
# Add endpoint: https://your-domain.com/api/webhooks/stripe
# Copy webhook secret:
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## Next Steps

1. **Read the full admin guide:**
   - See `ADMIN_GUIDE.md` for comprehensive documentation

2. **Set up webhooks:**
   - Clerk webhook for user sync
   - Stripe webhook for payments
   - See `SETUP_GUIDE.md`

3. **Configure social media OAuth:**
   - See `OAUTH_SETUP_GUIDE.md`
   - Required for actual post publishing

4. **Deploy to production:**
   - See `DEPLOYMENT.md`
   - Set up Vercel deployment
   - Configure production env vars

5. **Customize branding:**
   - Update logo in `/public`
   - Modify colors in `tailwind.config.js`
   - Update email templates

---

## Support

- **Full Admin Guide:** `ADMIN_GUIDE.md`
- **Setup Guide:** `SETUP_GUIDE.md`
- **Deployment:** `DEPLOYMENT.md`
- **OAuth Setup:** `OAUTH_SETUP_GUIDE.md`
- **Payment Guide:** `PAYMENT_SYSTEM_GUIDE.md`

**Email:** support@goviral.com

---

**You're all set! 🎉**

Your GoViral admin panel is ready. Visit `/admin/dashboard` to start managing your platform.
