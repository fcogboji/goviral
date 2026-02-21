# Payment System & Subscription Management Guide

This guide explains the complete payment and subscription system implemented for GoViral.

## Overview

The payment system includes:
- **Trial with Card Required**: 7-day free trial requires card authorization upfront
- **Automatic Billing**: Card automatically charged after trial ends
- **Plan-Based Access Control**: Features restricted based on subscription plan
- **User Upgrades**: Users can upgrade their plan with prorated billing
- **Admin Management**: Full admin control over users and subscriptions
- **Recurring Billing**: Automatic monthly billing for active subscriptions

## Architecture

### Plan Structure

Plans are defined in `/src/lib/plan-features.ts`:

- **FREE**: 1 platform, 5 posts/month, basic analytics
- **STARTER**: 3 platforms, 50 posts/month, ₦5,000/month
- **CREATOR**: 10 platforms, 200 posts/month, ₦15,000/month
- **AGENCY**: Unlimited, ₦45,000/month

Each plan has specific feature limits that are enforced throughout the app.

### Database Schema

#### Subscription Model
```prisma
model Subscription {
  id                      String          @id
  userId                  String          @unique
  planId                  String
  planType                String          // Plan name
  status                  String          // trial, active, inactive, cancelled, past_due
  currentPeriodStart      DateTime
  currentPeriodEnd        DateTime
  trialEndsAt             DateTime?       // Trial end date
  cancelAtPeriodEnd       Boolean
  paystackCustomerId      String?
  paystackAuthCode        String?         // For recurring charges
  cardLast4               String?
  cardBrand               String?
  nextBillingDate         DateTime?
}
```

## User Flows

### 1. Trial Signup Flow

**Endpoint**: `POST /api/trial/start-with-card`

```typescript
// Request
{
  "planName": "Starter" // or "Creator", "Agency"
}

// Response
{
  "success": true,
  "authorizationUrl": "https://checkout.paystack.com/...",
  "reference": "trial_xxx_xxx",
  "plan": {
    "name": "Starter",
    "price": 5000,
    "features": [...],
    "trialDays": 7
  }
}
```

**Process**:
1. User selects a plan
2. System creates ₦1 authorization charge (not the full amount)
3. User enters card details on Paystack
4. Card is authorized and saved
5. Trial starts immediately for 7 days
6. Card will be charged full amount after 7 days

**Callback**: `/api/payment/trial-callback`

### 2. Trial to Paid Conversion

**Cron Job**: `/api/cron/process-trials` (runs daily at 1 AM)

**Process**:
1. Finds all trials ending today
2. Charges saved card for full plan amount
3. If successful → subscription becomes 'active'
4. If failed → subscription becomes 'past_due', user notified
5. Creates payment record
6. Sends notification to user

### 3. User Upgrade Flow

**Endpoint**: `POST /api/subscriptions/upgrade`

```typescript
// Request
{
  "newPlanName": "Creator"
}

// Response (with saved card)
{
  "success": true,
  "message": "Subscription upgraded successfully",
  "payment": {
    "amount": 3500, // Prorated amount
    "reference": "upgrade_xxx_xxx",
    "status": "success"
  }
}

// Response (without saved card)
{
  "success": true,
  "authorizationUrl": "https://checkout.paystack.com/...",
  "payment": {
    "amount": 3500,
    "reference": "upgrade_xxx_xxx",
    "daysRemaining": 15
  }
}
```

**Prorated Calculation**:
```
Days remaining in period: 15 days
Current plan: Starter (₦5,000)
New plan: Creator (₦15,000)
Price difference: ₦10,000
Prorated amount: (₦10,000 / 30) × 15 = ₦5,000
```

**Get Upgrade Cost**: `GET /api/subscriptions/upgrade?plan=Creator`

### 4. Recurring Billing

**Cron Job**: `/api/cron/process-recurring-billing` (runs daily at 2 AM)

**Process**:
1. Finds active subscriptions due for billing
2. Charges saved card
3. If successful → extends subscription by 30 days
4. If failed → subscription becomes 'past_due', retry in 3 days
5. Creates payment record
6. Sends notification

## Access Control

### Check User Access

```typescript
import { getUserAccess, requireFeatureAccess, requireUsageLimit } from '@/lib/access-control';

// Get user's access object
const access = await getUserAccess(userId);

if (access) {
  // Check feature access
  const hasAI = access.canAccess('aiContentGeneration');

  // Check usage limits
  const platformCheck = await access.checkLimit('maxPlatforms');
  // Returns: { allowed: boolean, limit: number, current: number, remaining: number }
}

// Throw error if feature not available
await requireFeatureAccess(userId, 'bulkScheduling');

// Throw error if limit exceeded
await requireUsageLimit(userId, 'maxPostsPerMonth');
```

### Feature Gates in API

```typescript
import { requireUsageLimit } from '@/lib/access-control';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  // Check if user can create more posts
  try {
    await requireUsageLimit(user.id, 'maxPostsPerMonth');
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    );
  }

  // Proceed with post creation...
}
```

## Admin Management

### List Users

**Endpoint**: `GET /api/admin/users?page=1&limit=10&search=email&status=active`

### Update User

**Endpoint**: `PATCH /api/admin/users/:id`

```typescript
// Request
{
  "role": "admin", // Optional
  "planType": "Agency", // Optional
  "subscriptionStatus": "active" // Optional
}
```

### Delete User

**Endpoint**: `DELETE /api/admin/users/:id`

**Note**: Admin cannot delete themselves

## Webhooks

### Paystack Webhook

**Endpoint**: `POST /api/webhooks/paystack`

**Events Handled**:
- `charge.success` - Payment successful
- `subscription.create` - Subscription created
- `subscription.disable` - Subscription cancelled
- `subscription.not_renew` - Subscription won't auto-renew
- `invoice.create` / `invoice.update` - Invoice events

**Setup**:
1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/paystack`
3. Copy webhook secret to `.env` as `PAYSTACK_SECRET_KEY`

## Environment Variables

```env
# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Cron Secret (for securing cron endpoints)
CRON_SECRET=your-random-secret-key
```

## Cron Jobs Setup

Cron jobs are configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-trials",
      "schedule": "0 1 * * *"  // Daily at 1 AM
    },
    {
      "path": "/api/cron/process-recurring-billing",
      "schedule": "0 2 * * *"  // Daily at 2 AM
    }
  ]
}
```

**Security**: Add `CRON_SECRET` to environment and pass it as Bearer token:
```
Authorization: Bearer your-cron-secret
```

## Testing

### Test Trial Signup

1. Use Paystack test cards:
   - Success: `4084084084084081`
   - Decline: `5060666666666666666`
2. Start trial with test card
3. Verify subscription status in database
4. Test automatic billing by manually calling cron endpoint:
   ```
   curl -X GET https://yourdomain.com/api/cron/process-trials \
     -H "Authorization: Bearer your-cron-secret"
   ```

### Test Upgrade

1. Create user with active subscription
2. Call upgrade endpoint
3. Verify prorated amount calculation
4. Complete payment
5. Verify subscription updated

## Common Issues

### Issue: Card not being charged after trial

**Solution**:
- Check if `paystackAuthCode` is saved in subscription
- Verify cron job is running
- Check Paystack logs for errors
- Ensure card is reusable (not a one-time auth)

### Issue: Prorated amount incorrect

**Solution**:
- Verify `currentPeriodEnd` date is correct
- Check days remaining calculation
- Ensure plan prices are correct in `plan-features.ts`

### Issue: User has access after cancellation

**Solution**:
- Check subscription status
- Verify middleware is checking status correctly
- User should have access until `currentPeriodEnd` even if cancelled

## Database Migration

When deploying, run:
```bash
npx prisma generate
npx prisma db push
```

Or for development:
```bash
npx prisma migrate dev --name add_subscription_features
```

## Next Steps

1. **Email Notifications**: Integrate with Resend/SendGrid for email alerts
2. **Retry Logic**: Implement retry logic for failed payments (currently 3-day retry)
3. **Downgrade Support**: Add support for plan downgrades
4. **Usage Tracking**: More granular usage tracking and analytics
5. **Invoice Generation**: PDF invoice generation for payments
6. **Payment History**: User-facing payment history page

## Support

For payment-related issues:
1. Check Paystack dashboard for transaction details
2. Review audit logs in database
3. Check notification records for user communications
4. Use admin panel to manually adjust subscriptions if needed
