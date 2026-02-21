# GoViral - Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables ✅

Ensure all production environment variables are set:

```bash
# Database
DATABASE_URL="postgresql://..." # Neon production database

# Clerk (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Paystack (Production)
PAYSTACK_SECRET_KEY=sk_live_... # LIVE key, not test
NEXT_PUBLIC_PAYSTACK_PUBLISHABLE_KEY=pk_live_...

# App
NEXT_PUBLIC_APP_URL=https://goviral.ng # Your production domain

# Cron Security
CRON_SECRET=<generate-strong-random-string>

# SMS (Production)
SMS_API_KEY=<your-production-api-key>

# Social Media APIs (Production)
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...
WHATSAPP_BUSINESS_ACCOUNT_ID=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
```

---

## Database Migration

### 1. Backup Current Database (If Applicable)

```bash
# Export current data
pg_dump $DATABASE_URL > backup.sql
```

### 2. Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Apply schema changes
npx prisma db push

# Or use migrations
npx prisma migrate deploy
```

### 3. Seed Production Database

```bash
# Seed with Nigerian pricing plans
npm run seed
```

---

## Vercel Deployment

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Production ready: Nigerian pricing + WhatsApp + all platforms"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Root Directory: `./` (leave default)

### Step 3: Configure Build Settings

Vercel should auto-detect from `vercel.json`:
- Build Command: `npx prisma generate && next build`
- Output Directory: `.next`
- Install Command: `npm install`

### Step 4: Environment Variables

Add ALL environment variables from `.env.example` in Vercel:
1. Go to Project Settings → Environment Variables
2. Add each variable with production values
3. Select "Production", "Preview", and "Development" scopes

**Critical Variables:**
- `DATABASE_URL` - Production Neon database
- `NEXT_PUBLIC_APP_URL` - Your Vercel domain (e.g., https://goviral.vercel.app)
- `CRON_SECRET` - Generate with: `openssl rand -base64 32`

### Step 5: Deploy

```bash
# Deploy to production
vercel --prod

# Or let GitHub Actions auto-deploy
# (Every push to main auto-deploys)
```

---

## Post-Deployment Setup

### 1. Update OAuth Redirect URLs

Update ALL social media apps with your production domain:

**Facebook/Instagram:**
- Valid OAuth Redirect URIs: `https://yourapp.com/api/auth/facebook/callback`

**Twitter:**
- Callback URLs: `https://yourapp.com/api/auth/twitter/callback`

**LinkedIn:**
- Redirect URLs: `https://yourapp.com/api/auth/linkedin/callback`

**YouTube:**
- Authorized redirect URIs: `https://yourapp.com/api/auth/youtube/callback`

**TikTok:**
- Redirect URI: `https://yourapp.com/api/auth/tiktok/callback`

**WhatsApp:**
- Callback URL: `https://yourapp.com/api/webhooks/whatsapp`

### 2. Update Clerk Settings

1. Go to Clerk Dashboard → Paths
2. Update:
   - Sign-in URL: `https://yourapp.com/sign-in`
   - Sign-up URL: `https://yourapp.com/sign-up`
   - After sign-in: `https://yourapp.com/dashboard`

3. Webhook endpoint: `https://yourapp.com/api/webhooks/clerk`

### 3. Update Paystack Webhook

1. Go to Paystack Dashboard → Settings → Webhooks
2. Add: `https://yourapp.com/api/payment/verify`
3. Save webhook secret in environment variables

### 4. Verify Cron Job

1. Go to Vercel Dashboard → Deployments → Functions
2. Check if `/api/cron/process-posts` appears
3. Test manually:
   ```bash
   curl -X GET https://yourapp.com/api/cron/process-posts \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

---

## Custom Domain Setup

### 1. Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `goviral.ng`, `www.goviral.ng`)

### 2. Update DNS Records

Add these records in your domain registrar:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### 3. Update Environment Variables

```env
NEXT_PUBLIC_APP_URL=https://goviral.ng
```

Redeploy after updating.

---

## Monitoring & Alerts

### 1. Enable Vercel Analytics

```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

### 2. Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

Initialize:
```bash
npx @sentry/wizard -i nextjs
```

### 3. Logging

Vercel automatically captures:
- Function logs
- Build logs
- Runtime logs

View in: Vercel Dashboard → Deployments → Function Logs

---

## Performance Optimization

### 1. Enable Caching

Already configured in Next.js:
- Static pages cached at CDN edge
- API routes can use `revalidate`

### 2. Image Optimization

Use Next.js Image component:
```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  width={500}
  height={300}
  alt="Description"
/>
```

### 3. Database Connection Pooling

Already using Prisma with connection pooling.

For better performance, consider:
- Neon's connection pooling
- PgBouncer for additional pooling

---

## Security Checklist

- [ ] All API keys are in environment variables (not committed)
- [ ] CRON_SECRET is set and secure
- [ ] Clerk webhook secret verified
- [ ] Rate limiting enabled (Vercel auto)
- [ ] CORS configured properly
- [ ] HTTPS enforced (Vercel default)
- [ ] Database connections use SSL
- [ ] No sensitive data in logs

---

## Backup Strategy

### Daily Automated Backups

Configure Neon for daily backups:
1. Go to Neon Console → Backups
2. Enable automatic daily backups
3. Set retention period (7-30 days)

### Manual Backup

```bash
# Export database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore if needed
psql $DATABASE_URL < backup-20250112.sql
```

---

## Scaling Considerations

### Current Limits (Starter)

- Vercel Free: 100GB bandwidth, 1000 builds/month
- Neon Free: 10GB storage, 300 compute hours/month
- Clerk Free: 10,000 monthly active users

### When to Upgrade

Upgrade Vercel to Pro when:
- Traffic > 100GB/month
- Need custom domains
- Want analytics dashboard

Upgrade Neon when:
- Storage > 10GB
- Need more compute hours
- Want automated backups

Upgrade Clerk when:
- MAUs > 10,000
- Need custom branding
- Want MFA/SSO

---

## Maintenance

### Weekly Tasks

- [ ] Check error logs in Sentry/Vercel
- [ ] Monitor scheduled post success rate
- [ ] Review user feedback
- [ ] Check API rate limits

### Monthly Tasks

- [ ] Review and optimize database queries
- [ ] Check social media API updates
- [ ] Update dependencies: `npm audit` & `npm update`
- [ ] Review analytics and usage patterns

### Quarterly Tasks

- [ ] Security audit
- [ ] Performance optimization
- [ ] Cost optimization review
- [ ] Feature usage analysis

---

## Rollback Plan

If something goes wrong:

### 1. Quick Rollback

```bash
# Revert to previous deployment in Vercel
vercel rollback
```

Or in Vercel Dashboard:
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### 2. Database Rollback

```bash
# Restore from backup
psql $DATABASE_URL < backup-previous.sql
```

---

## Launch Checklist

### Pre-Launch

- [ ] All tests passing
- [ ] All API integrations tested
- [ ] Payment flow tested (test cards)
- [ ] Email notifications working
- [ ] SMS notifications working
- [ ] Scheduled posts working
- [ ] All social media platforms tested
- [ ] Mobile responsive verified
- [ ] Performance tested
- [ ] Security audit completed

### Launch Day

- [ ] Monitor error rates
- [ ] Watch social media connections
- [ ] Monitor payment transactions
- [ ] Check scheduled post processor
- [ ] Be available for support
- [ ] Monitor server resources

### Post-Launch (First Week)

- [ ] Daily check of error logs
- [ ] Monitor user feedback
- [ ] Check payment success rates
- [ ] Verify all integrations stable
- [ ] Respond to user issues quickly

---

## Nigerian Market Launch Strategy

### Pricing Strategy

- Start with **₦5,000 - ₦45,000** pricing
- Offer **14-day free trial** (better than 7 days for Nigerian market)
- Accept **bank transfer** via Paystack
- Consider **monthly and annual** billing (discount annual)

### Marketing Channels

1. **Instagram & Facebook** - Primary channels
2. **Twitter/X** - Tech community
3. **WhatsApp Status** - Very popular in Nigeria
4. **LinkedIn** - Business audience
5. **TikTok** - Youth market

### Launch Locations

Start with major cities:
- Lagos (primary)
- Abuja
- Port Harcourt
- Ibadan
- Kano

---

## Support Setup

### Customer Support Channels

1. **WhatsApp** - Most preferred by Nigerians
   - Set up business WhatsApp: +234-XXX-XXX-XXXX
   - Use WhatsApp Business API for automated responses

2. **Email** - support@goviral.ng
   - Set up with Resend or Gmail workspace

3. **In-app Chat** - Consider Intercom or Crisp
   - Free tier sufficient initially

4. **Social Media**
   - Twitter DMs
   - Instagram DMs
   - Facebook Messenger

### Response Times

- WhatsApp: < 1 hour during business hours
- Email: < 24 hours
- Social media: < 2 hours

---

## Success Metrics

Track these KPIs:

### Business Metrics
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)
- Churn rate

### Product Metrics
- Daily/Monthly Active Users
- Posts published per user
- Platform connection rate
- Scheduled post success rate
- Payment success rate

### Technical Metrics
- API success rates
- Average response time
- Error rate
- Uptime (target: 99.9%)

---

## Emergency Contacts

Keep this list updated:

- **Vercel Support**: support@vercel.com
- **Neon Support**: support@neon.tech
- **Clerk Support**: support@clerk.com
- **Paystack Support**: support@paystack.com
- **Your Phone**: +234-XXX-XXX-XXXX

---

## Congratulations! 🎉

Your app is now live and ready to help Nigerian creators and businesses succeed on social media!

**Next steps:**
1. Start marketing to early adopters
2. Gather user feedback
3. Iterate quickly
4. Scale carefully

---

*Last updated: January 2025*
