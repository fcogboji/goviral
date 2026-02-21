# GoViral - Complete Admin Guide

**Version:** 1.0
**Last Updated:** November 2025
**Admin Email:** friday.ogboji100@gmail.com

---

## Table of Contents

1. [Overview](#overview)
2. [Pricing Structure](#pricing-structure)
3. [Getting Started as Admin](#getting-started-as-admin)
4. [Admin Dashboard Overview](#admin-dashboard-overview)
5. [Managing Users](#managing-users)
6. [Managing Posts & Content](#managing-posts--content)
7. [Managing Subscriptions & Billing](#managing-subscriptions--billing)
8. [Platform Integrations](#platform-integrations)
9. [Analytics & Reporting](#analytics--reporting)
10. [System Settings](#system-settings)
11. [Troubleshooting](#troubleshooting)

---

## Overview

GoViral is a comprehensive social media management platform that allows users to:
- Schedule and publish posts to multiple social media platforms
- Manage campaigns across Facebook, Instagram, Twitter/X, LinkedIn, YouTube, TikTok, and WhatsApp
- Track analytics and engagement metrics
- Generate AI-powered content suggestions
- Collaborate with teams

### Key Features
✅ **Real Social Media Posting** - Actual publishing to all major platforms
✅ **Automated Scheduling** - Posts publish automatically via cron jobs (every 10 minutes)
✅ **WhatsApp Business API** - Send messages, images, and videos
✅ **Stripe Integration** - Secure global payment processing
✅ **7-Day Free Trial** - New users get trial access
✅ **Multi-tier Subscriptions** - Starter, Creator, and Agency plans

---

## Pricing Structure

### Plan Comparison

| Feature | Starter | Creator | Agency |
|---------|---------|---------|--------|
| **Price (USD/month)** | $9 | $29 | $99 |
| **Social Platforms** | Up to 3 | Up to 10 | Unlimited |
| **Posts per Month** | 50 | 200 | Unlimited |
| **WhatsApp Messages** | 50 | 200 | Unlimited |
| **Analytics** | Basic | Advanced | Advanced + White-label |
| **AI Content** | Suggestions | Generation | Generation |
| **Support** | Email | Priority | Dedicated 24/7 |
| **Team Collaboration** | ❌ | ❌ | ✅ |
| **API Access** | ❌ | ❌ | ✅ |
| **Custom Branding** | ❌ | ❌ | ✅ |

### Supported Platforms
- **Facebook** - Post text, images, videos
- **Instagram** - Post photos, videos, reels
- **Twitter/X** - Tweet with media
- **LinkedIn** - Professional posts and articles
- **YouTube** - Video uploads and scheduling
- **TikTok** - Video uploads
- **WhatsApp Business** - Messages, images, videos

---

## Getting Started as Admin

### 1. First-Time Setup

After deployment, grant yourself admin access:

```bash
# Option 1: Use the set-admin script (Recommended)
npm run set-admin

# Option 2: Use Prisma Studio
npx prisma studio
# Navigate to User model → Find your email → Change role to "admin"

# Option 3: Direct database query
# Connect to your database and run:
# UPDATE users SET role = 'admin' WHERE email = 'friday.ogboji100@gmail.com';
```

### 2. Accessing the Admin Panel

**Local Development:**
```
http://localhost:3000/admin/dashboard
```

**Production:**
```
https://your-domain.com/admin/dashboard
```

### 3. Required Environment Variables

Ensure all environment variables are set in `.env.local` (see `.env.example`):

**Core:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` - Your app URL

**Authentication:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`

**Payments:**
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

**Social Media OAuth:**
- Facebook, Twitter, LinkedIn, Google (YouTube), TikTok credentials
- WhatsApp Business API credentials

**Cron Jobs:**
- `CRON_SECRET` - Random string to secure cron endpoints

---

## Admin Dashboard Overview

The admin panel consists of 12 main sections:

### 1. Dashboard (`/admin/dashboard`)
- **Overview metrics:** Total users, active subscriptions, revenue, posts
- **Recent activity:** Latest user signups, subscription changes
- **Quick stats:** Platform-wise distribution, plan distribution

### 2. Users Management (`/admin/users`)
- View all registered users
- Edit user roles (free, premium, admin)
- View user subscription details
- Delete or suspend accounts
- Export user data

**User Roles:**
- `free` - Free tier (default for new users)
- `premium` - Paid subscriber
- `admin` - Full admin access

### 3. Posts Management (`/admin/posts`)
- View all scheduled and published posts
- Moderate content
- Change post status (DRAFT, SCHEDULED, PUBLISHED, FAILED)
- Delete inappropriate content
- View post analytics

**Post Statuses:**
- `DRAFT` - Not ready to publish
- `SCHEDULED` - Queued for publishing
- `PUBLISHED` - Successfully posted
- `FAILED` - Publishing failed (check error logs)
- `CANCELLED` - User cancelled

### 4. Campaigns (`/admin/campaigns`)
- View all user campaigns
- Monitor campaign performance
- Manage campaign status

### 5. Analytics (`/admin/analytics`)
- Platform-wise engagement metrics
- User growth charts
- Revenue trends
- Top performing posts
- Export reports

### 6. Billing (`/admin/billing`)
- View all subscriptions
- Premium user list
- Subscription status overview
- Billing history

### 7. Transactions (`/admin/transactions`)
- All payment records
- Failed payments
- Refund management
- Payment method details

### 8. Plans Management (`/admin/plans`)
- Edit pricing (currently requires database update)
- View plan features
- Monitor plan distribution

### 9. Platform Integrations (`/admin/platforms`)
- Overview of all connected platforms
- Integration statistics
- Troubleshoot connection issues

### 10. API Keys (`/admin/api-keys`)
- Manage user API keys (for Agency plan)
- Revoke keys
- Monitor API usage

### 11. Audit Logs (`/admin/audit-logs`)
- Track all admin actions
- View system events
- Security monitoring
- Export logs for compliance

### 12. Settings (`/admin/settings`)
- System-wide configurations
- Email templates
- Notification settings
- Feature flags

---

## Managing Users

### View All Users

Navigate to `/admin/users` to see:
- Total user count
- User email, name, role
- Subscription status
- Sign-up date
- Last login

### Change User Role

1. Click "Edit" next to user
2. Select role:
   - **free** - No paid features
   - **premium** - Access to paid plan features
   - **admin** - Full admin access (use carefully!)
3. Save changes

**Note:** Changing to `premium` doesn't create a subscription. Users should subscribe through the proper flow.

### Delete User

1. Click "Delete" next to user
2. Confirm deletion
3. **Warning:** This is permanent and deletes:
   - User account
   - All posts
   - All campaigns
   - Analytics data
   - Subscription records

### View User Details

Click on a user to see:
- Profile information
- Connected platforms
- Subscription details
- Post history
- Analytics summary

---

## Managing Posts & Content

### Monitor All Posts

Navigate to `/admin/posts` to:
- View all posts across all users
- Filter by status, platform, date
- Search by content or user

### Moderate Content

If inappropriate content is posted:

1. Locate the post in admin panel
2. Click "View Details"
3. Options:
   - **Change to DRAFT** - Prevent publishing
   - **Change to CANCELLED** - Stop scheduled post
   - **Delete** - Permanently remove

### Troubleshoot Failed Posts

If posts show `FAILED` status:

1. Click on the post
2. Check the error message in `PostResult`
3. Common issues:
   - **Expired token** - User needs to reconnect platform
   - **Invalid permissions** - Platform permissions revoked
   - **Rate limit** - Platform API limits exceeded
   - **Content policy** - Content violates platform rules

4. Solutions:
   - Ask user to reconnect platform
   - Check platform integration settings
   - Review error in audit logs

### Automated Post Publishing

Posts are automatically published by a cron job:

**Endpoint:** `/api/cron/process-posts`
**Frequency:** Every 10 minutes (Vercel Cron)
**Security:** Protected by `CRON_SECRET`

**How it works:**
1. Cron job runs every 10 minutes
2. Finds posts with `status=SCHEDULED` and `scheduledFor <= now`
3. Publishes to selected platforms via social media APIs
4. Updates status to `PUBLISHED` or `FAILED`
5. Records results in `PostResult` table

**Monitoring:**
- Check Vercel logs for cron execution
- Review failed posts in admin panel
- Check audit logs for errors

---

## Managing Subscriptions & Billing

### Subscription Lifecycle

1. **Trial** - 7 days free trial (all Creator features)
2. **Active** - Paid subscription
3. **Past Due** - Payment failed, grace period
4. **Cancelled** - User cancelled, expires at period end
5. **Inactive** - Subscription expired

### View Subscriptions

Navigate to `/admin/billing`:
- Active subscriptions
- Trial users
- Cancelled subscriptions
- Revenue metrics

### Handle Payment Issues

For `past_due` subscriptions:

1. Check `/admin/transactions` for failed payment
2. View payment error message
3. User needs to update payment method
4. Stripe will auto-retry based on settings

### Process Refunds

⚠️ **Important:** Refunds must be processed through Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Find payment by reference ID
3. Click "Refund"
4. Partial or full refund
5. Update subscription in admin panel if needed

### Subscription Webhooks

Stripe webhooks automatically update subscription status:

**Webhook URL:** `https://your-domain.com/api/webhooks/stripe`

**Events handled:**
- `checkout.session.completed` - New subscription
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_failed` - Payment failure
- `invoice.payment_succeeded` - Successful payment

**Troubleshooting:**
- Check webhook logs in Stripe Dashboard
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check `/admin/audit-logs` for webhook events

---

## Platform Integrations

### Supported Platforms & Setup

All platforms require OAuth credentials. See `OAUTH_SETUP_GUIDE.md` for detailed setup.

#### Facebook & Instagram
- **Developer Portal:** https://developers.facebook.com
- **Required:** App ID, App Secret
- **Permissions:** `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`
- **Redirect URI:** `https://your-domain.com/api/auth/facebook`

#### Twitter/X
- **Developer Portal:** https://developer.twitter.com
- **Required:** Client ID, Client Secret
- **Permissions:** Read and Write
- **Redirect URI:** `https://your-domain.com/api/auth/twitter`

#### LinkedIn
- **Developer Portal:** https://developer.linkedin.com
- **Required:** Client ID, Client Secret
- **Permissions:** `w_member_social`, `r_basicprofile`
- **Redirect URI:** `https://your-domain.com/api/auth/linkedin`

#### YouTube (Google)
- **Console:** https://console.cloud.google.com
- **Required:** Client ID, Client Secret
- **APIs:** YouTube Data API v3
- **Redirect URI:** `https://your-domain.com/api/auth/youtube`

#### TikTok
- **Developer Portal:** https://developers.tiktok.com
- **Required:** Client Key, Client Secret
- **Permissions:** `video.upload`
- **Redirect URI:** `https://your-domain.com/api/auth/tiktok`

#### WhatsApp Business
- **Portal:** https://business.facebook.com/wa/manage/home
- **Required:** Business Account ID, Phone Number ID, Access Token
- **Setup:** More complex, requires business verification

### Monitor Platform Health

Navigate to `/admin/platforms`:
- Total integrations per platform
- Failed connections
- Token expiration warnings

### Troubleshoot Connection Issues

Common problems:

1. **"Token expired"**
   - User must reconnect account
   - Check token refresh logic in `/lib/social-media/`

2. **"Permission denied"**
   - User revoked app permissions
   - Check OAuth scopes
   - User must reconnect with proper permissions

3. **"API rate limit"**
   - Platform limiting API calls
   - Wait for rate limit reset
   - Consider upgrading platform API tier

---

## Analytics & Reporting

### Available Metrics

Navigate to `/admin/analytics`:

**User Metrics:**
- Total users
- Active users (posted in last 30 days)
- User growth rate
- Churn rate

**Content Metrics:**
- Total posts published
- Posts by platform
- Engagement rates
- Best performing content

**Revenue Metrics:**
- Monthly recurring revenue (MRR)
- Average revenue per user (ARPU)
- Subscription distribution
- Trial conversion rate

**Platform Metrics:**
- Most used platform
- Engagement by platform
- Publishing success rate

### Export Reports

1. Click "Export" on any analytics page
2. Select date range
3. Choose format (CSV, PDF)
4. Download report

### Custom Analytics Queries

For custom reports, use Prisma Studio:

```bash
npx prisma studio
```

Or write custom queries in `/app/api/admin/analytics/custom/route.ts`

---

## System Settings

### Email Configuration

**Email Provider:** Resend
**Configuration:** `.env.local`

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Email Templates:**
- Welcome email (new user)
- Trial started
- Trial ending (2 days before)
- Subscription confirmed
- Payment failed
- Subscription cancelled

### Notification Settings

Users can receive notifications via:
- **In-app** - Dashboard notifications
- **Email** - Via Resend
- **SMS** - (Optional, requires Twilio)

Configure in `/admin/settings`

### Feature Flags

Enable/disable features globally:
- AI content generation
- WhatsApp integration
- Bulk scheduling
- Team collaboration

### Cron Job Configuration

**Post Scheduler:**
- **File:** `/api/cron/process-posts/route.ts`
- **Frequency:** Every 10 minutes
- **Security:** Requires `CRON_SECRET` header

**Vercel Cron Configuration:**
Located in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/process-posts",
    "schedule": "*/10 * * * *"
  }]
}
```

**Manual Trigger (for testing):**
```bash
curl -X GET https://your-domain.com/api/cron/process-posts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Troubleshooting

### Common Issues

#### 1. User can't sign up

**Symptoms:** Sign-up fails, error shown

**Checks:**
- Clerk webhook is configured
- `CLERK_WEBHOOK_SECRET` is correct
- Database is accessible
- Check audit logs for errors

**Solution:**
```bash
# Check Clerk webhook logs
# Go to Clerk Dashboard → Webhooks → View logs

# Verify database connection
npm run db:test

# Check user creation in database
npx prisma studio
```

#### 2. Posts not publishing

**Symptoms:** Posts stuck in SCHEDULED status

**Checks:**
- Cron job is running (check Vercel logs)
- Platform tokens are valid
- User has connected platforms
- Check post errors in database

**Solution:**
```bash
# Check cron logs in Vercel dashboard
# Navigate to: Deployments → Functions → Logs

# Manually trigger cron (testing only)
curl -X GET http://localhost:3000/api/cron/process-posts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Check PostResult table for errors
npx prisma studio → PostResult
```

#### 3. Payments failing

**Symptoms:** Checkout doesn't complete

**Checks:**
- Stripe keys are correct (test vs. prod)
- Webhook is configured
- `STRIPE_WEBHOOK_SECRET` matches Stripe
- Check Stripe logs

**Solution:**
```bash
# Verify Stripe configuration
# Stripe Dashboard → Developers → API keys
# Stripe Dashboard → Developers → Webhooks

# Test webhook locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Check payment logs
# /admin/transactions
```

#### 4. Platform integration fails

**Symptoms:** Can't connect social media account

**Checks:**
- OAuth credentials are correct
- Redirect URI matches exactly
- Platform app is in production mode (not dev)
- Required permissions are requested

**Solution:**
```bash
# Check OAuth redirect URI
# Must match EXACTLY in platform settings
# Example: https://yourdomain.com/api/auth/facebook

# Verify environment variables
# FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, etc.

# Check platform app status
# Some platforms require app review/approval
```

#### 5. Admin panel not accessible

**Symptoms:** Redirected to dashboard, not admin panel

**Checks:**
- User role is set to "admin"
- Logged in with correct account
- Middleware is working

**Solution:**
```bash
# Check user role in database
npx prisma studio → User → Check "role" field

# Should be "admin", not "free" or "premium"

# If needed, set admin manually:
npm run set-admin
```

### Logs & Debugging

**Application Logs:**
- Vercel Dashboard → Deployments → Functions → Runtime Logs

**Database Logs:**
- Neon Dashboard → Databases → Query Monitor

**Stripe Logs:**
- Stripe Dashboard → Developers → Logs

**Clerk Logs:**
- Clerk Dashboard → Logs

**Audit Logs (in app):**
- `/admin/audit-logs`

### Getting Help

1. **Check documentation:**
   - `README.md` - Overview and setup
   - `SETUP_GUIDE.md` - Complete setup guide
   - `DEPLOYMENT.md` - Deployment checklist
   - `OAUTH_SETUP_GUIDE.md` - Platform OAuth setup
   - `PAYMENT_SYSTEM_GUIDE.md` - Payment integration

2. **Check logs:**
   - Vercel logs for runtime errors
   - Stripe logs for payment issues
   - Audit logs for admin actions

3. **Database inspection:**
   ```bash
   npx prisma studio
   ```

4. **Support:**
   - Email: support@goviral.com
   - GitHub Issues: (if applicable)

---

## Security Best Practices

### Environment Variables
- ✅ **Never** commit `.env.local` to git
- ✅ Use different keys for dev and production
- ✅ Rotate secrets regularly
- ✅ Use strong `CRON_SECRET`

### User Data
- ✅ All passwords handled by Clerk (secure)
- ✅ OAuth tokens encrypted in database
- ✅ Sensitive data never logged
- ✅ GDPR compliance for user deletion

### API Security
- ✅ All API routes protected by auth middleware
- ✅ Rate limiting on public endpoints
- ✅ CORS configured properly
- ✅ Input validation with Zod

### Webhooks
- ✅ Verify webhook signatures (Stripe, Clerk)
- ✅ Use webhook secrets from env vars
- ✅ Log all webhook events
- ✅ Handle replay attacks

---

## Maintenance Tasks

### Daily
- [ ] Check failed posts in `/admin/posts`
- [ ] Monitor payment failures in `/admin/transactions`
- [ ] Review new user signups

### Weekly
- [ ] Review platform integration health
- [ ] Check audit logs for suspicious activity
- [ ] Monitor subscription churn rate
- [ ] Review top performing content

### Monthly
- [ ] Export analytics reports
- [ ] Review and optimize database
- [ ] Update pricing if needed
- [ ] Check for outdated dependencies
- [ ] Review and update documentation

### Quarterly
- [ ] Security audit
- [ ] Performance optimization
- [ ] User feedback review
- [ ] Feature roadmap planning

---

## Support & Resources

### Documentation
- [Setup Guide](SETUP_GUIDE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [OAuth Setup](OAUTH_SETUP_GUIDE.md)
- [Payment Setup](PAYMENT_SYSTEM_GUIDE.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

### Community
- GitHub Issues: (your repo)
- Discord: (if applicable)
- Email: support@goviral.com

---

**Last Updated:** November 2025
**Admin:** friday.ogboji100@gmail.com
**Version:** 1.0
