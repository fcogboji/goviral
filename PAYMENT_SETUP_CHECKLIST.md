# Payment System Setup Checklist

## ✅ Completed Implementation

### 1. Plan Features & Access Control
- ✅ Created `/src/lib/plan-features.ts` with plan definitions
- ✅ Implemented FREE, STARTER, CREATOR, and AGENCY plans
- ✅ Added feature limits per plan
- ✅ Created prorated billing calculation

### 2. Database Schema
- ✅ Updated Prisma schema with subscription card fields:
  - `paystackAuthCode` - for recurring charges
  - `cardLast4`, `cardBrand`, `cardExpMonth`, `cardExpYear`
  - `trialEndsAt`, `nextBillingDate`
  - `cancelAtPeriodEnd` flag
- ✅ Generated Prisma client

### 3. Payment Integration (Paystack)
- ✅ Enhanced `/src/lib/paystack.ts` with:
  - Card authorization charging
  - Customer management
  - Subscription management
  - Recurring payment support

### 4. Trial Signup with Card
- ✅ Created `/src/app/api/trial/start-with-card/route.ts`
  - Requires card authorization before trial starts
  - Authorizes ₦1 to verify card
  - Saves card for future billing
- ✅ Created `/src/app/api/payment/trial-callback/route.ts`
  - Handles payment verification
  - Creates trial subscription with 7-day period
  - Stores card authorization

### 5. Automatic Billing
- ✅ Created `/src/app/api/cron/process-trials/route.ts`
  - Runs daily to process ending trials
  - Charges full amount after 7 days
  - Converts to active subscription
  - Handles payment failures
- ✅ Created `/src/app/api/cron/process-recurring-billing/route.ts`
  - Processes monthly recurring billing
  - Auto-charges active subscriptions
  - Handles payment failures with retry logic

### 6. Access Control System
- ✅ Created `/src/lib/access-control.ts`:
  - `getUserAccess()` - Get user's plan access
  - `requireFeatureAccess()` - Enforce feature restrictions
  - `requireUsageLimit()` - Enforce usage limits
  - `isAdmin()` - Check admin status
  - `requireAdmin()` - Enforce admin access

### 7. Admin User Management
- ✅ Created `/src/app/api/admin/users/route.ts` - List all users
- ✅ Updated `/src/app/api/admin/users/[id]/route.ts`:
  - PATCH - Update user role, plan, subscription status
  - DELETE - Delete users (with safety checks)
  - Audit logging for all actions

### 8. User Self-Upgrade
- ✅ Created `/src/app/api/subscriptions/upgrade/route.ts`:
  - POST - Upgrade to higher plan with prorated billing
  - GET - Calculate upgrade cost preview
  - Automatic charging if card on file
  - Payment flow if no card saved
- ✅ Created `/src/app/api/payment/upgrade-callback/route.ts`
  - Handles upgrade payment verification

### 9. Webhooks
- ✅ Created `/src/app/api/webhooks/paystack/route.ts`:
  - Handles all Paystack events
  - Signature verification for security
  - Updates subscriptions based on events
  - User notifications

### 10. Cron Configuration
- ✅ Updated `vercel.json` with cron jobs:
  - Trial processing (1 AM daily)
  - Recurring billing (2 AM daily)

## 🔧 Required Setup Steps

### 1. Environment Variables

Add to `.env` and Vercel/deployment platform:

```env
# Paystack Keys
PAYSTACK_SECRET_KEY=sk_live_xxxxx  # Get from Paystack Dashboard
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx  # Get from Paystack Dashboard

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # Your production URL

# Cron Security
CRON_SECRET=generate-random-secure-string  # For cron endpoint security

# Database (already configured)
DATABASE_URL=postgresql://...

# Clerk (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

### 2. Paystack Configuration

#### A. Get API Keys
1. Go to https://dashboard.paystack.com/
2. Settings → API Keys & Webhooks
3. Copy Test/Live secret and public keys
4. Add to environment variables

#### B. Setup Webhook
1. In Paystack Dashboard → Settings → Webhooks
2. Click "Add Webhook"
3. URL: `https://yourdomain.com/api/webhooks/paystack`
4. Events to subscribe:
   - `charge.success`
   - `subscription.create`
   - `subscription.disable`
   - `subscription.not_renew`
   - `invoice.create`
   - `invoice.update`
5. Save webhook

### 3. Database Migration

```bash
# Generate Prisma client (already done)
npx prisma generate

# Push schema to database
npx prisma db push

# Or create migration (for production)
npx prisma migrate deploy
```

### 4. Create Admin User

Run this in your database or via Prisma Studio:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

Or use Prisma:
```typescript
await prisma.user.update({
  where: { email: 'admin@example.com' },
  data: { role: 'admin' }
});
```

### 5. Seed Plans

Create a seed script or run manually:

```typescript
const plans = [
  {
    name: 'Starter',
    price: 5000,
    currency: 'NGN',
    features: [
      'Connect up to 3 social platforms',
      'Schedule 50 posts per month',
      'Advanced analytics',
      'AI content suggestions',
      'Email support'
    ],
    maxPosts: 50,
    maxPlatforms: 3,
    maxWhatsAppMessages: 100
  },
  {
    name: 'Creator',
    price: 15000,
    currency: 'NGN',
    features: [
      'Connect up to 10 social platforms',
      'Schedule 200 posts per month',
      'Advanced analytics & reports',
      'AI content generation',
      'Bulk scheduling',
      'WhatsApp Business integration',
      'Priority support'
    ],
    maxPosts: 200,
    maxPlatforms: 10,
    maxWhatsAppMessages: 500
  },
  {
    name: 'Agency',
    price: 45000,
    currency: 'NGN',
    features: [
      'Unlimited social platforms',
      'Unlimited posts per month',
      'Advanced analytics & white-label reports',
      'AI content generation',
      'Bulk scheduling',
      'Team collaboration',
      'WhatsApp Business integration',
      'API access',
      'Custom branding',
      'Dedicated support'
    ],
    maxPosts: -1,
    maxPlatforms: -1,
    maxWhatsAppMessages: -1
  }
];

for (const planData of plans) {
  await prisma.plan.upsert({
    where: { name: planData.name },
    create: planData,
    update: planData
  });
}
```

### 6. Vercel/Deployment Configuration

#### A. Environment Variables
Add all `.env` variables to Vercel dashboard:
- Project Settings → Environment Variables
- Add each variable for Production, Preview, and Development

#### B. Cron Jobs
- Cron jobs in `vercel.json` are automatically configured
- Verify they're running: Vercel Dashboard → Deployments → Cron Jobs

#### C. Cron Secret
Generate a secure random string:
```bash
openssl rand -base64 32
```
Add as `CRON_SECRET` environment variable

### 7. Test the System

#### Test Trial Signup
```bash
# Use Paystack test card: 4084084084084081
# CVV: 408, PIN: 0000, OTP: 123456

curl -X POST https://yourdomain.com/api/trial/start-with-card \
  -H "Content-Type: application/json" \
  -d '{"planName": "Starter"}'
```

#### Test Cron Jobs (Local)
```bash
# Test trial processing
curl -X GET http://localhost:3000/api/cron/process-trials \
  -H "Authorization: Bearer your-cron-secret"

# Test recurring billing
curl -X GET http://localhost:3000/api/cron/process-recurring-billing \
  -H "Authorization: Bearer your-cron-secret"
```

#### Test Upgrade
```bash
curl -X POST https://yourdomain.com/api/subscriptions/upgrade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer clerk-token" \
  -d '{"newPlanName": "Creator"}'
```

## 📝 Integration Points for Frontend

### 1. Trial Signup Page
```typescript
// Example implementation
const startTrial = async (planName: string) => {
  const response = await fetch('/api/trial/start-with-card', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planName })
  });

  const data = await response.json();

  if (data.authorizationUrl) {
    // Redirect user to Paystack payment page
    window.location.href = data.authorizationUrl;
  }
};
```

### 2. Upgrade Flow
```typescript
// Get upgrade cost
const response = await fetch(`/api/subscriptions/upgrade?plan=${newPlan}`);
const { proratedAmount, daysRemaining } = await response.json();

// Show user the cost
console.log(`Upgrade cost: ₦${proratedAmount} for ${daysRemaining} days`);

// Proceed with upgrade
const upgradeResponse = await fetch('/api/subscriptions/upgrade', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ newPlanName: newPlan })
});
```

### 3. Feature Gates
```typescript
import { getUserAccessByClerkId } from '@/lib/access-control';

const access = await getUserAccessByClerkId(userId);

if (!access?.canAccess('bulkScheduling')) {
  // Show upgrade prompt
  return <UpgradePrompt feature="Bulk Scheduling" />;
}

// Show feature
return <BulkScheduler />;
```

### 4. Admin Panel
```typescript
// List users
const users = await fetch('/api/admin/users?page=1');

// Update user subscription
await fetch(`/api/admin/users/${userId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    planType: 'Agency',
    subscriptionStatus: 'active'
  })
});
```

## 🎯 Testing Checklist

- [ ] Trial signup with valid card works
- [ ] Trial signup with invalid card fails gracefully
- [ ] Card details are saved after successful authorization
- [ ] Trial period is exactly 7 days
- [ ] Automatic billing happens after 7 days
- [ ] Failed payment moves subscription to 'past_due'
- [ ] User receives notifications for all billing events
- [ ] Upgrade calculates correct prorated amount
- [ ] Upgrade with saved card works instantly
- [ ] Upgrade without saved card shows payment page
- [ ] Admin can update user subscriptions
- [ ] Admin can delete users (except themselves)
- [ ] Feature gates block access for lower plans
- [ ] Usage limits are enforced
- [ ] Webhooks update subscription status correctly
- [ ] Cron jobs run on schedule
- [ ] Payment history is recorded correctly

## 📚 Documentation

- ✅ Main guide: `PAYMENT_SYSTEM_GUIDE.md`
- ✅ Setup checklist: This file
- See `/src/lib/plan-features.ts` for plan definitions
- See `/src/lib/access-control.ts` for access control utilities

## 🚀 Go Live Checklist

Before going to production:

1. [ ] Switch to Paystack Live keys
2. [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
3. [ ] Configure Paystack webhook with production URL
4. [ ] Set up all environment variables in production
5. [ ] Run database migrations
6. [ ] Seed plans in production database
7. [ ] Create admin user(s)
8. [ ] Test trial signup with real card
9. [ ] Monitor cron jobs for first 7 days
10. [ ] Set up error monitoring (Sentry, etc.)
11. [ ] Test webhook events
12. [ ] Verify email notifications are working
13. [ ] Test payment failure scenarios
14. [ ] Review Paystack dashboard regularly

## 🆘 Support

If you encounter issues:

1. Check Paystack dashboard for transaction logs
2. Review Vercel logs for cron job execution
3. Check database audit logs
4. Verify webhook signature is valid
5. Ensure all environment variables are set correctly
6. Test with Paystack test cards first

## Next Features to Implement

1. **Email notifications** - Welcome emails, payment receipts
2. **Payment history page** - User-facing payment history
3. **Invoice generation** - PDF invoices
4. **Plan comparison page** - Help users choose plans
5. **Usage dashboard** - Show current usage vs limits
6. **Downgrade support** - Allow downgrades at period end
7. **Cancel subscription** - User-initiated cancellation
8. **Pause subscription** - Temporary pause feature
9. **Team management** - For Agency plan
10. **API rate limiting** - Based on plan tier
